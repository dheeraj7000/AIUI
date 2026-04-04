variable "project" {
  description = "Project name used as a prefix for bucket names"
  type        = string
}

variable "stage" {
  description = "Deployment stage (e.g. dev, staging, prod)"
  type        = string
}
