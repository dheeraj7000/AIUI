# --- Amazon Linux 2023 AMI (free tier eligible) ---
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# --- Elastic IP (free when attached to running instance) ---
resource "aws_eip" "main" {
  domain = "vpc"

  tags = {
    Name = "${var.project}-eip-${var.stage}"
  }
}

resource "aws_eip_association" "main" {
  instance_id   = aws_instance.main.id
  allocation_id = aws_eip.main.id
}

# --- EC2 Instance ---
resource "aws_instance" "main" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.micro"
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.ec2_sg_id]
  iam_instance_profile   = var.instance_profile_name
  key_name               = var.key_name != "" ? var.key_name : null

  associate_public_ip_address = true

  root_block_device {
    volume_size = 20 # GB — free tier includes 30GB EBS
    volume_type = "gp3"
    encrypted   = false
  }

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    project            = var.project
    stage              = var.stage
    db_host            = var.db_host
    db_port            = var.db_port
    db_name            = var.db_name
    db_username        = var.db_username
    db_password        = var.db_password
    jwt_secret         = var.jwt_secret
    cognito_pool_id    = var.cognito_user_pool_id
    cognito_client_id  = var.cognito_client_id
    cognito_region     = var.cognito_region
    s3_assets_bucket   = var.s3_assets_bucket
    s3_bundles_bucket  = var.s3_bundles_bucket
    s3_previews_bucket = var.s3_previews_bucket
  }))

  tags = {
    Name = "${var.project}-server-${var.stage}"
  }

  lifecycle {
    ignore_changes = [ami]
  }
}
