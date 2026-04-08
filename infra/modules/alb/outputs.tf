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
