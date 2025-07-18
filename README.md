# NutriSnap – A Cloud-Native Food Nutrition Scanner
---

## 🚀 Overview

NutriSnap is a cloud-native food barcode scanner web application that enables users to scan product barcodes, fetch nutritional data, compare multiple products, and raise tickets for missing product information. Built using a microservice architecture, the application leverages AWS-managed infrastructure, secure networking, and observability for a scalable and production-grade deployment.

---

## 🧠 Key Features

- 📸 Scan barcodes using device camera (ZXing)
- 📊 View and compare nutrition data of scanned products
- 🧾 Raise a support ticket for unrecognized items with image upload
- 🔐 HTTPS-based secure access using self-signed TLS via NGINX Ingress
- 🧠 Cloud-native infrastructure with cost-effective design and full observability

---

## 🏗️ Architecture Summary

### Frontend
- Built with: HTML, CSS, JavaScript (modular)
- Hosted on: EKS (private subnet) served via NGINX on Alpine
- Access: Exposed via Ingress Controller with TLS (HTTPS)

### Backend
- Built with: Spring Boot (Java)
- RESTful APIs for barcode lookup, history, and ticket system
- Stateless microservice deployed as a pod in EKS (private subnet)

### Infrastructure

| Layer        | Service/Tool Used                              |
|--------------|------------------------------------------------|
| Compute      | Amazon EKS with EC2 worker nodes               |
| Networking   | Custom VPC, Public/Private Subnets, NAT GW     |
| Storage      | Amazon DynamoDB (scan data) <br> Amazon S3 (ticket uploads) |
| Ingress      | NGINX Ingress Controller (public subnet)       |
| Observability| Fluent Bit → CloudWatch Logs                   |
| Messaging    | Amazon SNS (email alerts for new tickets)      |
| IaC          | Terraform (modular configuration)              |

### Ingress Strategy
- HTTPS via NGINX Ingress (TLS from self-signed cert)
- No ALB used due to ACM restriction in AWS Academy Learner Lab

---

## 🔐 Security Considerations

- Private subnets for application pods (backend/frontend)
- NGINX Ingress in public subnet only routes to internal services
- Self-signed TLS certificate for encrypted communication
- IAM role restrictions in Academy Lab explained; alternatives proposed
- CloudWatch Logs for tracking and alerting
- SNS notifications to email for user ticket events

---

## 📦 State Management Note

Current architecture uses shared state in backend (Java `List<Product>`), which leads to leakage across sessions. Future versions will introduce:
- JWT-based user identity
- Per-user scan history stored in DynamoDB
- Stateless REST APIs with secure scoped access

---

## 🧾 Raise Ticket Feature

- User uploads 2 images (barcode & product front) for unrecognized products
- Images stored in S3 with secure access
- SNS email alert sent to admin
- Future: Label-based ML model for product classification

---

## 💸 Cost Optimization

| Resource           | Pricing Strategy              |
|--------------------|-------------------------------|
| EKS                | EC2 nodes on t3.medium        |
| CloudWatch         | Log retention: 7 days         |
| S3                 | Pay-per-use, small object size|
| DynamoDB           | On-demand billing mode        |
| SNS                | Free tier email notifications |
| Terraform          | Reusable, low-ops maintenance |

---

## 🛠️ Future Roadmap

- ✅ Multi-user authentication with Cognito
- ✅ Per-user scan history
- 🔄 Role-based dashboards (Admin/User)
- 🧠 AI Model Integration to classify unknown food products
- 📈 Nutrition dashboard and calorie tracking

---

## 🧰 Technologies Used

**Backend:** Java Spring Boot  
**Frontend:** HTML, CSS, JS, ZXing  
**DevOps & IaC:** Terraform, GitHub Actions  
**Cloud Services:** EKS, EC2, DynamoDB, S3, SNS, CloudWatch, Fluent Bit, NGINX  
**Security:** TLS, Private Subnets, IAM (planned), Token Auth (planned)


---

