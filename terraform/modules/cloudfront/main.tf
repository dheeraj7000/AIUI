###############################################################################
# CloudFront Module — S3 assets (OAC) + EC2 custom origin
###############################################################################

# ---------------------------------------------------------------------------
# Data sources — AWS-managed cache & origin-request policies
# ---------------------------------------------------------------------------

data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewer"
}

# ---------------------------------------------------------------------------
# Origin Access Control for S3
# ---------------------------------------------------------------------------

resource "aws_cloudfront_origin_access_control" "s3_oac" {
  name                              = "${var.project}-assets-oac-${var.stage}"
  description                       = "OAC for S3 assets bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ---------------------------------------------------------------------------
# CloudFront Distribution
# ---------------------------------------------------------------------------

locals {
  s3_origin_id  = "s3-assets"
  ec2_origin_id = "ec2-app"
}

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  http_version        = "http2"
  price_class         = "PriceClass_100"
  default_root_object = ""
  comment             = "${var.project} distribution (${var.stage})"

  # --- Origin 1: S3 assets via OAC -------------------------------------------

  origin {
    domain_name              = var.assets_bucket_domain_name
    origin_id                = local.s3_origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.s3_oac.id
  }

  # --- Origin 2: EC2 custom HTTP origin --------------------------------------

  origin {
    domain_name = var.ec2_public_dns
    origin_id   = local.ec2_origin_id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # --- Default behavior → EC2 ------------------------------------------------

  default_cache_behavior {
    target_origin_id         = local.ec2_origin_id
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = true
    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
  }

  # --- Ordered behavior: /assets/* → S3 --------------------------------------

  ordered_cache_behavior {
    path_pattern           = "/assets/*"
    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 86400
  }

  # --- Restrictions -----------------------------------------------------------

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # --- TLS / Viewer certificate -----------------------------------------------

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Project = var.project
    Stage   = var.stage
  }
}

# ---------------------------------------------------------------------------
# S3 Bucket Policy — allow CloudFront OAC to read from assets bucket
# ---------------------------------------------------------------------------

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket_policy" "assets_oac" {
  bucket = var.assets_bucket_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAC"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${var.assets_bucket_arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.main.arn
          }
        }
      }
    ]
  })
}
