###############################################################################
# EC2 Security Group
###############################################################################

resource "aws_security_group" "ec2" {
  name        = "${var.project}-ec2-sg-${var.stage}"
  description = "Security group for EC2 instances"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project}-ec2-sg-${var.stage}"
  }
}

# Ingress — HTTP
resource "aws_security_group_rule" "ec2_http_ingress" {
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.ec2.id
  description       = "Allow HTTP from anywhere"
}

# Ingress — HTTPS
resource "aws_security_group_rule" "ec2_https_ingress" {
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.ec2.id
  description       = "Allow HTTPS from anywhere"
}

# Ingress — SSH (conditional)
resource "aws_security_group_rule" "ec2_ssh_ingress" {
  count = var.enable_ssh ? 1 : 0

  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.ec2.id
  description       = "Allow SSH from anywhere"
}

# Egress — all traffic
resource "aws_security_group_rule" "ec2_all_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.ec2.id
  description       = "Allow all outbound traffic"
}

###############################################################################
# RDS Security Group
###############################################################################

resource "aws_security_group" "rds" {
  name        = "${var.project}-rds-sg-${var.stage}"
  description = "Security group for RDS instances"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project}-rds-sg-${var.stage}"
  }
}

# Ingress — PostgreSQL from EC2 security group only
resource "aws_security_group_rule" "rds_postgres_ingress" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ec2.id
  security_group_id        = aws_security_group.rds.id
  description              = "Allow PostgreSQL from EC2 security group"
}
