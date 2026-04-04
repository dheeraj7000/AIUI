variable "project" {
  type = string
}

variable "stage" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_id" {
  description = "Public subnet ID for the EC2 instance"
  type        = string
}

variable "ec2_sg_id" {
  type = string
}

variable "instance_profile_name" {
  type = string
}

variable "key_name" {
  description = "EC2 key pair name (empty = no SSH key)"
  type        = string
  default     = ""
}

variable "db_host" {
  type = string
}

variable "db_port" {
  type    = string
  default = "5432"
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "cognito_user_pool_id" {
  type = string
}

variable "cognito_client_id" {
  type = string
}

variable "cognito_region" {
  type    = string
  default = "us-east-1"
}

variable "s3_assets_bucket" {
  type = string
}

variable "s3_bundles_bucket" {
  type = string
}

variable "s3_previews_bucket" {
  type = string
}
