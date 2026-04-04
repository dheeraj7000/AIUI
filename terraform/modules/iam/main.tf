###############################################################################
# EC2 IAM Role
###############################################################################

data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2" {
  name               = "${var.project}-ec2-role-${var.stage}"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json

  tags = {
    Name = "${var.project}-ec2-role-${var.stage}"
  }
}

###############################################################################
# Managed Policy — SSM Session Manager
###############################################################################

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

###############################################################################
# Inline Policy — S3, CloudWatch Logs, Secrets Manager
###############################################################################

data "aws_iam_policy_document" "ec2_inline" {
  # S3 object operations on each bucket
  statement {
    sid    = "S3ObjectAccess"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = [for arn in var.s3_bucket_arns : "${arn}/*"]
  }

  # S3 bucket-level listing
  statement {
    sid    = "S3BucketList"
    effect = "Allow"
    actions = [
      "s3:ListBucket",
    ]
    resources = var.s3_bucket_arns
  }

  # CloudWatch Logs
  statement {
    sid    = "CloudWatchLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["*"]
  }

  # Secrets Manager
  statement {
    sid    = "SecretsManagerRead"
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "ec2_inline" {
  name   = "${var.project}-ec2-inline-${var.stage}"
  role   = aws_iam_role.ec2.id
  policy = data.aws_iam_policy_document.ec2_inline.json
}

###############################################################################
# Instance Profile
###############################################################################

resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project}-ec2-profile-${var.stage}"
  role = aws_iam_role.ec2.name

  tags = {
    Name = "${var.project}-ec2-profile-${var.stage}"
  }
}
