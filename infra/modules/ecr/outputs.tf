output "web_repository_url" {
  value = aws_ecr_repository.web.repository_url
}

output "web_repository_arn" {
  value = aws_ecr_repository.web.arn
}

output "mcp_repository_url" {
  value = aws_ecr_repository.mcp.repository_url
}

output "mcp_repository_arn" {
  value = aws_ecr_repository.mcp.arn
}

output "registry_id" {
  value = aws_ecr_repository.web.registry_id
}
