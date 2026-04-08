variable "project_name" {
  description = "Project name used for parameter path prefix"
  type        = string
  default     = "aiui"
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
