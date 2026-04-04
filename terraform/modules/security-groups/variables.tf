variable "vpc_id" {
  description = "ID of the VPC where security groups will be created"
  type        = string
}

variable "project" {
  description = "Project name used for resource naming"
  type        = string
}

variable "stage" {
  description = "Deployment stage (e.g. dev, staging, prod)"
  type        = string
}

variable "enable_ssh" {
  description = "Whether to allow SSH (port 22) ingress on the EC2 security group"
  type        = bool
  default     = false
}
