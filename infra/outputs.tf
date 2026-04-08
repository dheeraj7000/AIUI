output "alb_dns_name" {
  description = "ALB DNS name — use this to access the application"
  value       = module.alb.alb_dns_name
}

output "ec2_public_ip" {
  description = "EC2 instance public IP"
  value       = module.ec2.public_ip
}

output "ecr_web_url" {
  description = "ECR repository URL for web app"
  value       = module.ecr.web_repository_url
}

output "ecr_mcp_url" {
  description = "ECR repository URL for MCP server"
  value       = module.ecr.mcp_repository_url
}

output "ssh_command" {
  description = "SSH command to connect to EC2"
  value       = "ssh -i ${module.ec2.private_key_path} ec2-user@${module.ec2.public_ip}"
}

output "web_url" {
  description = "Web application URL"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "http://${module.alb.alb_dns_name}"
}

output "mcp_url" {
  description = "MCP server URL"
  value       = var.domain_name != "" ? "https://${var.domain_name}/mcp" : "http://${module.alb.alb_dns_name}/mcp"
}

output "health_url" {
  description = "MCP health check URL"
  value       = var.domain_name != "" ? "https://${var.domain_name}/health" : "http://${module.alb.alb_dns_name}/health"
}

output "gitlab_deploy_role_arn" {
  description = "ARN of the GitLab CI deploy role (set as CI/CD variable)"
  value       = module.iam.gitlab_deploy_role_arn
}

output "cert_validation_records" {
  description = "Add these DNS records in your domain registrar to validate the SSL certificate"
  value       = module.alb.cert_validation_records
}

output "domain_cname_target" {
  description = "Point your domain (CNAME) to this ALB DNS name"
  value       = module.alb.alb_dns_name
}
