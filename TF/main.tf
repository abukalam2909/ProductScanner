# ----------------------
# VARIABLES
# ----------------------

variable "aws_region" {
  default = "us-east-1"
}

variable "cluster_name" {
  default = "barcode-cluster"
}

variable "ecr_backend_repo_name" {
  default = "barcode-backend"
}

variable "ecr_frontend_repo_name" {
  default = "barcode-frontend"
}

variable "az1" {
  default = "us-east-1a"
}

variable "az2" {
  default = "us-east-1b"
}

# ----------------------
# PROVIDERS
# ----------------------

provider "aws" {
  region = var.aws_region
}

# Kubernetes provider for Helm access
provider "kubernetes" {
  host                   = aws_eks_cluster.eks_cluster.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.eks_cluster.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

provider "helm" {
  kubernetes {
    host                   = aws_eks_cluster.eks_cluster.endpoint
    cluster_ca_certificate = base64decode(aws_eks_cluster.eks_cluster.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.cluster.token
  }
}

data "aws_eks_cluster_auth" "cluster" {
  name = aws_eks_cluster.eks_cluster.name
}

# ----------------------
# VPC AND SUBNETS
# ----------------------

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "project-vpc" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags = { Name = "project-igw" }
}

resource "aws_eip" "nat" {
  domain = "vpc"
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public1.id
  tags = { Name = "project-nat-gateway" }
  depends_on = [aws_internet_gateway.igw]
}

resource "aws_subnet" "public1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = var.az1
  map_public_ip_on_launch = true
  tags = {
    Name                     = "public-subnet-1"
    "kubernetes.io/role/elb" = "1"
  }
}

resource "aws_subnet" "public2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = var.az2
  map_public_ip_on_launch = true
  tags = {
    Name                     = "public-subnet-2"
    "kubernetes.io/role/elb" = "1"
  }
}

resource "aws_subnet" "private1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.3.0/24"
  availability_zone       = var.az1
  map_public_ip_on_launch = false
  tags = {
    Name                              = "private-subnet-1"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

resource "aws_subnet" "private2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.4.0/24"
  availability_zone       = var.az2
  map_public_ip_on_launch = false
  tags = {
    Name                              = "private-subnet-2"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = { Name = "public-rt" }
}

resource "aws_route_table_association" "public1" {
  subnet_id      = aws_subnet.public1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public2" {
  subnet_id      = aws_subnet.public2.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }
  tags = { Name = "private-rt" }
}

resource "aws_route_table_association" "private1" {
  subnet_id      = aws_subnet.private1.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private2" {
  subnet_id      = aws_subnet.private2.id
  route_table_id = aws_route_table.private.id
}

# ----------------------
# DYNAMO DB
# ----------------------

resource "aws_dynamodb_table" "scan_data" {
  name         = "product-scan-data"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "barcode"

  attribute {
    name = "barcode"
    type = "S"
  }

  tags = {
    Name        = "product-scan-data"
    Environment = "dev"
  }
}

# ----------------------
# S3 BUCKET
# ----------------------
#
# resource "random_id" "image_bucket_suffix" {
#   byte_length = 4
# }

resource "aws_s3_bucket" "product_images" {
  bucket        = "product-images-nutrition-analyser-29092001"
  force_destroy = true
  tags = {
    Name = "product-image-uploads"
  }
}

resource "aws_s3_bucket_public_access_block" "image_block" {
  bucket = aws_s3_bucket.product_images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
resource "aws_iam_policy" "s3_access_policy" {
  name = "S3UploadPolicy"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = [
          "s3:PutObject",
          "s3:GetObject"
        ],
        Resource = "${aws_s3_bucket.product_images.arn}/*"
      }
    ]
  })
}



# ----------------------
# EKS CLUSTER + NODE GROUP
# ----------------------

resource "aws_eks_cluster" "eks_cluster" {
  name     = var.cluster_name
  role_arn = "arn:aws:iam::290182369109:role/LabRole"

  vpc_config {
    subnet_ids             = [aws_subnet.private1.id, aws_subnet.private2.id]
    endpoint_public_access = true
  }
}

resource "aws_eks_node_group" "default" {
  cluster_name    = aws_eks_cluster.eks_cluster.name
  node_group_name = "default-node-group"
  node_role_arn   = "arn:aws:iam::290182369109:role/LabRole"
  subnet_ids      = [aws_subnet.private1.id, aws_subnet.private2.id]

  scaling_config {
    desired_size = 2
    max_size     = 2
    min_size     = 1
  }

  instance_types = ["t3.medium"]
  ami_type       = "AL2_x86_64"
  disk_size      = 20
}

# ----------------------
# NGINX INGRESS CONTROLLER
# ----------------------

resource "helm_release" "nginx_ingress" {
  name       = "nginx-ingress-controller"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  namespace  = "ingress-nginx"
  create_namespace = true

  set {
    name  = "controller.service.type"
    value = "LoadBalancer"
  }

  set {
    name  = "controller.publishService.enabled"
    value = "true"
  }
}

# ----------------------
# ECR REPOSITORY
# ----------------------

resource "aws_ecr_repository" "backend" {
  name                 = var.ecr_backend_repo_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "backend-ecr"
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = var.ecr_frontend_repo_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "frontend-ecr"
  }
}

# ----------------------
# OUTPUTS
# ----------------------

output "ecr_repo_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "eks_cluster_name" {
  value = aws_eks_cluster.eks_cluster.name
}

output "eks_cluster_endpoint" {
  value = aws_eks_cluster.eks_cluster.endpoint
}

output "public_subnet_ids" {
  value = [aws_subnet.public1.id, aws_subnet.public2.id]
}

output "private_subnet_ids" {
  value = [aws_subnet.private1.id, aws_subnet.private2.id]
}
