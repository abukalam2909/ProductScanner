# YouTube Analytics Studio

A GenAI-powered content intelligence platform that goes beyond traditional YouTube metrics. Instead of simply analyzing views or likes, this serverless application offers deep insight into viewer sentiment, preferences, and behavioral patterns using a hybrid AI+LLM approach.

## 🚀 Overview

This project was developed as part of the **Advanced Cloud Architecting** course at **Dalhousie University**, and built with real-world, production-grade AWS architecture in mind. It leverages **Claude 3 Sonnet via Amazon Bedrock** and **Amazon Comprehend** to analyze YouTube video comments, captions, and metadata for powerful content strategy insights.

## 🧠 What It Does

Drop a YouTube Channel ID and the system will:

* Fetch video metadata, tags, titles, likes, views, captions, and comments.
* Store structured data in DynamoDB, and raw JSON in Amazon S3.
* Run sentiment and topic extraction using **Amazon Comprehend**.
* Perform GenAI-powered viewer insight generation via **Claude 3 Sonnet**.
* Return a dashboard-ready JSON response highlighting:

  * Viewer sentiment distribution
  * Content engagement insights
  * Publishing time patterns
  * AI-generated suggestions

## 🛠️ Architecture Highlights

* **Serverless Microservices on AWS**

  * Amazon API Gateway
  * AWS Lambda (multiple functions for ingest, NLP, LLM)
  * Amazon DynamoDB (structured metadata)
  * Amazon S3 (raw and processed data)
  * Amazon Comprehend (sentiment and topic extraction)
  * Amazon Bedrock (Claude 3 Sonnet for GenAI analysis)
  * Amazon SNS (alerting on resource over-usage)
  * Amazon CloudWatch (monitoring and logging)
* **Networking & Security**

  * VPC with private and public subnets
  * All compute in **private subnets** behind **NAT Gateway**
  * IAM roles with least privilege principle
  * No public access to processing units
* **IaC:** All infrastructure provisioned via **Terraform**

## 📊 Monitoring & Alerts

* Lambda, Bedrock, and Comprehend invocations monitored via **CloudWatch**
* Alarms set on invocation thresholds and execution errors
* **Amazon SNS** sends email notifications to admin on threshold breaches

## 🧪 Prompt Engineering

The Claude 3 LLM prompt was custom-designed to:

* Understand viewer intent through selective comment sampling
* Prioritize recent and high-sentiment interactions
* Generate insights like:

  * Content suggestions
  * Preferred tone or video length
  * Identifying disengagement signals
* Filter spam-like or bot-generated comments heuristically

## 🔐 AWS Well-Architected Framework Alignment

* **Security**: Private subnets, IAM least privilege, no public compute
* **Reliability**: Retry logic in Lambda, regional services, NAT HA
* **Performance Efficiency**: Event-driven compute, no idle infra
* **Cost Optimization**: Fully serverless, auto-scaling
* **Operational Excellence**: Terraform for reproducibility, CloudWatch metrics
* **Sustainability**: Minimized always-on resources, minimal footprint

## 📈 Future Scope

* Comment vector embeddings via OpenSearch
* Viewer retention prediction using ML
* Creator-specific prompt tuning
* Engagement lifecycle visualization
* Multi-language sentiment expansion (e.g., Tamil)

## 📂 Repository Structure

```
.
├── Lambda/
│   ├── lambda_youtube_ingest.py
│   ├── lambda_nlp_sentiment_analysis.py
│   ├── lambda_fetch_results.py
│   └── lambda_llm_insight.py
├── Terraform/
│   ├── vpc.tf
│   ├── lambda.tf
│   ├── dynamodb.tf
│   ├── s3.tf
│   ├── iam.tf
│   └── api_gateway.tf
├── assets/
│   └── architecture_diagram.png
├── README.md
```

## Acknowledgements

Special thanks to **Professor Lu Yang** and **TA Shrey Monka** for their constant guidance and support.

## 📬 Connect

I'm open to feedback, collaborations, or discussions on GenAI x Cloud Engineering. DM or reach out if you're interested in the GitHub repo, architectural breakdown, or contributing ideas.

---

**#GenAI #Claude3 #AmazonBedrock #YouTubeAnalytics #AWS #Serverless #RAG #AIEngineering #Comprehend #Terraform #StudentProjects #DalhousieUniversity #CloudComputing #Innovation #OpenToCollaboration**
