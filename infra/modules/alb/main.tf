# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group_id]
  subnets            = var.subnet_ids

  tags = {
    Name = "${var.project_name}-alb"
  }
}

# Target Group: Web App (port 3000)
resource "aws_lb_target_group" "web" {
  name     = "${var.project_name}-web-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
    path                = "/api/health"
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-web-tg"
  }
}

# Target Group: MCP Server (port 8080)
resource "aws_lb_target_group" "mcp" {
  name     = "${var.project_name}-mcp-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
    path                = "/health"
    matcher             = "200"
  }

  stickiness {
    enabled         = true
    type            = "lb_cookie"
    cookie_duration = 1800 # 30 minutes, matches MCP SESSION_TTL_MS
  }

  tags = {
    Name = "${var.project_name}-mcp-tg"
  }
}

# =============================================================================
# ACM Certificate (only when domain is provided)
# =============================================================================

resource "aws_acm_certificate" "main" {
  count             = var.domain_name != "" ? 1 : 0
  domain_name       = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method = "DNS"

  tags = {
    Name = "${var.project_name}-cert"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# =============================================================================
# Listeners
# =============================================================================

# HTTP listener — redirects to HTTPS when domain is set, otherwise forwards directly
resource "aws_lb_listener" "http" {
  count             = var.domain_name != "" ? 0 : 1
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

# HTTP listener that redirects to HTTPS (when domain is configured)
resource "aws_lb_listener" "http_redirect" {
  count             = var.domain_name != "" ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# Certificate validation — waits until DNS records are added
resource "aws_acm_certificate_validation" "main" {
  count           = var.domain_name != "" ? 1 : 0
  certificate_arn = aws_acm_certificate.main[0].arn
}

# HTTPS listener (waits for cert validation)
resource "aws_lb_listener" "https" {
  count             = var.domain_name != "" ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate_validation.main[0].certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

# =============================================================================
# Path-based routing rules
# =============================================================================

# MCP route on HTTP (only when no domain — otherwise HTTP is just a redirect)
resource "aws_lb_listener_rule" "mcp_http" {
  count        = var.domain_name != "" ? 0 : 1
  listener_arn = aws_lb_listener.http[0].arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.mcp.arn
  }

  condition {
    path_pattern {
      values = ["/mcp", "/mcp/*", "/health"]
    }
  }
}

# MCP route on HTTPS
resource "aws_lb_listener_rule" "mcp_https" {
  count        = var.domain_name != "" ? 1 : 0
  listener_arn = aws_lb_listener.https[0].arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.mcp.arn
  }

  condition {
    path_pattern {
      values = ["/mcp", "/mcp/*", "/health"]
    }
  }
}
