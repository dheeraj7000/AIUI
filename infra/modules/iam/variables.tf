variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "aiui"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}

variable "gitlab_group" {
  description = "GitLab group or username (e.g., dkumar70)"
  type        = string
}

variable "gitlab_project" {
  description = "GitLab project path (e.g., dkumar70/AIUI)"
  type        = string
}

variable "ecr_web_arn" {
  description = "ARN of the web ECR repository"
  type        = string
}

variable "ecr_mcp_arn" {
  description = "ARN of the MCP ECR repository"
  type        = string
}
