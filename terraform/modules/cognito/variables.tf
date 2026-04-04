variable "project" {
  description = "Project name used as a prefix for resource naming"
  type        = string
}

variable "stage" {
  description = "Deployment stage (e.g. dev, staging, prod)"
  type        = string
}

variable "callback_urls" {
  description = "Additional OAuth callback URLs beyond the default localhost entry"
  type        = list(string)
  default     = []
}

variable "logout_urls" {
  description = "Additional logout URLs beyond the default localhost entry"
  type        = list(string)
  default     = []
}
