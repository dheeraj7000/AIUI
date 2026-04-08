output "database_url_parameter_name" {
  value = aws_ssm_parameter.database_url.name
}

output "jwt_secret_parameter_name" {
  value = aws_ssm_parameter.jwt_secret.name
}
