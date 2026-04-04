variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name prefix"
  type        = string
  default     = "aiui"
}

variable "stage" {
  description = "Deployment stage"
  type        = string
  default     = "dev"
}

variable "db_username" {
  description = "RDS master username"
  type        = string
  default     = "aiui_admin"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "RDS database name"
  type        = string
  default     = "aiui"
}

variable "jwt_secret" {
  description = "JWT secret for web app auth (min 32 chars)"
  type        = string
  sensitive   = true
}

variable "ec2_key_name" {
  description = "EC2 SSH key pair name (optional, for debugging)"
  type        = string
  default     = ""
}

variable "alarm_email" {
  description = "Email for CloudWatch alarm notifications"
  type        = string
  default     = ""
}

variable "app_domain" {
  description = "Custom domain for the app (optional)"
  type        = string
  default     = ""
}
