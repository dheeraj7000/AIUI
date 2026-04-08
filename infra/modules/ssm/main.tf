resource "aws_ssm_parameter" "database_url" {
  name        = "/${var.project_name}/database-url"
  description = "Neon PostgreSQL connection string"
  type        = "SecureString"
  value       = var.database_url

  tags = {
    Name = "${var.project_name}-database-url"
  }
}

resource "aws_ssm_parameter" "jwt_secret" {
  name        = "/${var.project_name}/jwt-secret"
  description = "JWT signing secret"
  type        = "SecureString"
  value       = var.jwt_secret

  tags = {
    Name = "${var.project_name}-jwt-secret"
  }
}
