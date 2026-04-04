variable "project" {
  description = "Project name used for resource naming"
  type        = string
}

variable "stage" {
  description = "Deployment stage (e.g. dev, staging, prod)"
  type        = string
}

variable "s3_bucket_arns" {
  description = "List of S3 bucket ARNs the EC2 role needs access to"
  type        = list(string)
}
