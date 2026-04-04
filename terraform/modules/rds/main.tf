################################################################################
# RDS PostgreSQL — AWS Free Tier ($0)
################################################################################

resource "aws_db_subnet_group" "this" {
  name       = "${var.project}-${var.stage}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name    = "${var.project}-${var.stage}-db-subnet-group"
    Project = var.project
    Stage   = var.stage
  }
}

resource "aws_db_instance" "this" {
  identifier = "${var.project}-${var.stage}-postgres"

  # Engine
  engine         = "postgres"
  engine_version = "15"

  # Instance — db.t3.micro is free-tier eligible
  instance_class = "db.t3.micro"

  # Storage — 20 GB gp2, no auto-scaling to stay in free tier
  allocated_storage     = 20
  max_allocated_storage = 20
  storage_type          = "gp2"
  storage_encrypted     = false

  # Database
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # Networking
  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [var.rds_sg_id]
  publicly_accessible    = false
  multi_az               = false

  # Backups & snapshots — dev, keep costs at zero
  backup_retention_period = 0
  skip_final_snapshot     = true
  deletion_protection     = false

  # Performance insights off for free tier
  performance_insights_enabled = false

  tags = {
    Name    = "${var.project}-${var.stage}-postgres"
    Project = var.project
    Stage   = var.stage
  }
}
