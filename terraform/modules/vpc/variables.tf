variable "project" {
  description = "Project name used for resource naming and tags"
  type        = string
}

variable "stage" {
  description = "Deployment stage (e.g. dev, staging, prod)"
  type        = string
}

variable "region" {
  description = "AWS region for availability zone selection"
  type        = string
}
