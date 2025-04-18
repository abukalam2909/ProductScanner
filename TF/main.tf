# ----------------------
# VARIABLES
# ----------------------

variable "aws_region" {
  default = "us-east-1"
}

variable "cluster_name" {
  default = "barcode-cluster"
}

variable "ecr_repo_name" {
  default = "barcode-backend"
}

variable "az1" {
  default = "us-east-1a"
}

variable "az2" {
  default = "us-east-1b"
}

# ----------------------
# PROVIDER
# ----------------------

provider "aws" {
  region = var.aws_region
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

resource "aws_subnet" "public1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = var.az1
  map_public_ip_on_launch = true
  tags = { Name = "public-subnet-1" }
}

resource "aws_subnet" "public2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = var.az2
  map_public_ip_on_launch = true
  tags = { Name = "public-subnet-2" }
}

resource "aws_subnet" "private1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.3.0/24"
  availability_zone       = var.az1
  map_public_ip_on_launch = false
  tags = { Name = "private-subnet-1" }
}

resource "aws_subnet" "private2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.4.0/24"
  availability_zone       = var.az2
  map_public_ip_on_launch = false
  tags = { Name = "private-subnet-2" }
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

# ----------------------
# S3 BUCKET FOR UI
# ----------------------

resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "frontend" {
  bucket = "barcode-ui-${random_id.suffix.hex}"
  tags = { Name = "Frontend UI Bucket" }
}

# ----------------------
# ECR REPOSITORY
# ----------------------

resource "aws_ecr_repository" "backend" {
  name                 = var.ecr_repo_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "backend-ecr"
  }
}

# ----------------------
# EKS CLUSTER (MANUAL IAM ROLES REQUIRED)
# ----------------------

resource "aws_eks_cluster" "eks_cluster" {
  name     = var.cluster_name
  role_arn = "arn:aws:iam::290182369109:role/LabRole" # Replace manually

  vpc_config {
    subnet_ids = [aws_subnet.public1.id, aws_subnet.public2.id]
  }
}

resource "aws_eks_fargate_profile" "default" {
  cluster_name           = aws_eks_cluster.eks_cluster.name
  fargate_profile_name   = "default"
  pod_execution_role_arn = "arn:aws:iam::290182369109:role/LabRole" # Replace manually
  subnet_ids             = [aws_subnet.private1.id, aws_subnet.private2.id]

  selector {
    namespace = "default"
  }
}

# ----------------------
# OUTPUTS
# ----------------------

output "s3_bucket_name" {
  value = aws_s3_bucket.frontend.bucket
}

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
