output "web_url" {
  description = "AIUI Web App URL (HTTP via EC2 public IP)"
  value       = "http://${module.ec2.public_ip}"
}

output "mcp_url" {
  description = "AIUI MCP Server URL"
  value       = "http://${module.ec2.public_ip}:8080"
}

output "cloudfront_url" {
  description = "CloudFront HTTPS URL"
  value       = "https://${module.cloudfront.cloudfront_domain_name}"
}

output "ec2_public_ip" {
  description = "EC2 instance public IP"
  value       = module.ec2.public_ip
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = module.rds.db_endpoint
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.user_pool_id
}

output "cognito_client_id" {
  description = "Cognito App Client ID"
  value       = module.cognito.client_id
}

output "mcp_config_snippet" {
  description = "Paste this into your project's .mcp.json"
  value       = <<-EOT
    {
      "mcpServers": {
        "aiui": {
          "type": "url",
          "url": "http://${module.ec2.public_ip}:8080/mcp",
          "headers": {
            "Authorization": "Bearer YOUR_API_KEY"
          }
        }
      }
    }
  EOT
}

output "ssh_command" {
  description = "SSH into EC2 (if key_name was set)"
  value       = var.ec2_key_name != "" ? "ssh -i ~/.ssh/${var.ec2_key_name}.pem ec2-user@${module.ec2.public_ip}" : "Use SSM: aws ssm start-session --target ${module.ec2.instance_id}"
}

output "cost_summary" {
  description = "Monthly cost estimate"
  value       = <<-EOT
    === AWS Free Tier Cost: $0/month ===
    EC2 t3.micro:     $0 (750 hrs/mo free)
    RDS t3.micro:     $0 (750 hrs/mo free)
    EBS 20GB gp3:     $0 (30 GB/mo free)
    RDS 20GB gp2:     $0 (20 GB/mo free)
    S3:               $0 (5 GB/mo free)
    CloudFront:       $0 (1 TB/mo free)
    Cognito:          $0 (<50K MAU always free)
    Elastic IP:       $0 (free when attached)
    Data Transfer:    $0 (100 GB/mo free)
    ---
    Total:            $0/month

    After free tier (12 months):
    EC2 t3.micro:     ~$8.50/mo
    RDS t3.micro:     ~$13/mo
    EBS + RDS storage: ~$3/mo
    Total:            ~$25/mo
  EOT
}
