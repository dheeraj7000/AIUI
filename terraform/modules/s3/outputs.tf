output "assets_bucket_name" {
  description = "Name of the assets S3 bucket"
  value       = aws_s3_bucket.assets.bucket
}

output "bundles_bucket_name" {
  description = "Name of the bundles S3 bucket"
  value       = aws_s3_bucket.bundles.bucket
}

output "previews_bucket_name" {
  description = "Name of the previews S3 bucket"
  value       = aws_s3_bucket.previews.bucket
}

output "assets_bucket_id" {
  description = "ID of the assets S3 bucket"
  value       = aws_s3_bucket.assets.id
}

output "assets_bucket_domain_name" {
  description = "Regional domain name of the assets S3 bucket"
  value       = aws_s3_bucket.assets.bucket_regional_domain_name
}

output "assets_bucket_arn" {
  description = "ARN of the assets S3 bucket"
  value       = aws_s3_bucket.assets.arn
}

output "bundles_bucket_arn" {
  description = "ARN of the bundles S3 bucket"
  value       = aws_s3_bucket.bundles.arn
}

output "previews_bucket_arn" {
  description = "ARN of the previews S3 bucket"
  value       = aws_s3_bucket.previews.arn
}

output "all_bucket_arns" {
  description = "List of all bucket ARNs"
  value = [
    aws_s3_bucket.assets.arn,
    aws_s3_bucket.bundles.arn,
    aws_s3_bucket.previews.arn,
  ]
}
