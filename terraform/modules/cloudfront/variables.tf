variable "project" {
  description = "Project name used for resource naming"
  type        = string
}

variable "stage" {
  description = "Deployment stage (e.g. dev, staging, prod)"
  type        = string
}

variable "assets_bucket_domain_name" {
  description = "Regional domain name of the S3 assets bucket"
  type        = string
}

variable "assets_bucket_id" {
  description = "ID (name) of the S3 assets bucket for the bucket policy"
  type        = string
}

variable "assets_bucket_arn" {
  description = "ARN of the S3 assets bucket"
  type        = string
}

variable "ec2_public_dns" {
  description = "Public DNS hostname of the EC2 instance"
  type        = string
}
