variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "aiui"
}

variable "image_retention_count" {
  description = "Number of images to retain per repository"
  type        = number
  default     = 5
}
