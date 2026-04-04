###############################################################################
# S3 Module — Assets, Bundles, Previews buckets
###############################################################################

locals {
  assets_bucket_name   = "${var.project}-assets-${var.stage}"
  bundles_bucket_name  = "${var.project}-bundles-${var.stage}"
  previews_bucket_name = "${var.project}-previews-${var.stage}"

  cors_rules = [{
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "HEAD"]
    allowed_origins = ["http://localhost:3000"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3600
  }]
}

# ---------------------------------------------------------------------------
# 1. Assets bucket
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "assets" {
  bucket        = local.assets_bucket_name
  force_destroy = true

  tags = {
    Project = var.project
    Stage   = var.stage
  }
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "HEAD"]
    allowed_origins = ["http://localhost:3000"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3600
  }
}

# ---------------------------------------------------------------------------
# 2. Bundles bucket
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "bundles" {
  bucket        = local.bundles_bucket_name
  force_destroy = true

  tags = {
    Project = var.project
    Stage   = var.stage
  }
}

resource "aws_s3_bucket_versioning" "bundles" {
  bucket = aws_s3_bucket.bundles.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "bundles" {
  bucket = aws_s3_bucket.bundles.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "bundles" {
  bucket = aws_s3_bucket.bundles.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "bundles" {
  bucket = aws_s3_bucket.bundles.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "HEAD"]
    allowed_origins = ["http://localhost:3000"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3600
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "bundles" {
  bucket = aws_s3_bucket.bundles.id

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

# ---------------------------------------------------------------------------
# 3. Previews bucket
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "previews" {
  bucket        = local.previews_bucket_name
  force_destroy = true

  tags = {
    Project = var.project
    Stage   = var.stage
  }
}

resource "aws_s3_bucket_versioning" "previews" {
  bucket = aws_s3_bucket.previews.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "previews" {
  bucket = aws_s3_bucket.previews.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "previews" {
  bucket = aws_s3_bucket.previews.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "previews" {
  bucket = aws_s3_bucket.previews.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "HEAD"]
    allowed_origins = ["http://localhost:3000"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3600
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "previews" {
  bucket = aws_s3_bucket.previews.id

  rule {
    id     = "expire-objects"
    status = "Enabled"

    filter {}

    expiration {
      days = 30
    }
  }
}
