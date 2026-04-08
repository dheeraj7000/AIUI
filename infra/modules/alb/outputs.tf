output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "alb_zone_id" {
  value = aws_lb.main.zone_id
}

output "alb_arn" {
  value = aws_lb.main.arn
}

output "web_target_group_arn" {
  value = aws_lb_target_group.web.arn
}

output "mcp_target_group_arn" {
  value = aws_lb_target_group.mcp.arn
}

output "cert_validation_records" {
  description = "DNS records to add in your domain registrar for certificate validation"
  value = var.domain_name != "" ? [
    for dvo in aws_acm_certificate.main[0].domain_validation_options : {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  ] : []
}
