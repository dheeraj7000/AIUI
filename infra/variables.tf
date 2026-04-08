variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for all resource naming"
  type        = string
  default     = "aiui"
}

variable "instance_type" {
  description = "EC2 instance type (t3.micro for free tier)"
  type        = string
  default     = "t3.micro"
}

variable "ssh_allowed_cidr" {
  description = "CIDR block allowed to SSH into EC2 instance"
  type        = string
  default     = "0.0.0.0/0"
}

variable "gitlab_group" {
  description = "GitLab group or username for OIDC (e.g., dkumar70)"
  type        = string
}

variable "gitlab_project" {
  description = "GitLab project path for OIDC (e.g., dkumar70/AIUI)"
  type        = string
}

variable "database_url" {
  description = "Neon PostgreSQL connection string"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret (32+ characters)"
  type        = string
  sensitive   = true
}
