variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "aiui"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "subnet_id" {
  description = "Subnet ID for the EC2 instance"
  type        = string
}

variable "security_group_id" {
  description = "EC2 security group ID"
  type        = string
}

variable "instance_profile_name" {
  description = "IAM instance profile name"
  type        = string
}

variable "web_target_group_arn" {
  description = "ALB target group ARN for web app"
  type        = string
}

variable "mcp_target_group_arn" {
  description = "ALB target group ARN for MCP server"
  type        = string
}

variable "ecr_registry" {
  description = "ECR registry URL (e.g. 123456789.dkr.ecr.us-east-1.amazonaws.com)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "key_name" {
  description = "Name for the SSH key pair"
  type        = string
  default     = "aiui-key"
}
