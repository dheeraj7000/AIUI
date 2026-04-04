###############################################################################
# VPC Module — Free Tier ($0) networking
# - 1 public subnet  (EC2)
# - 2 private subnets (RDS subnet group)
# - Internet Gateway, NO NAT Gateway
###############################################################################

data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  az_a = "${var.region}a"
  az_b = "${var.region}b"

  common_tags = {
    Project = var.project
    Stage   = var.stage
  }
}

# ---------- VPC ----------

resource "aws_vpc" "this" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(local.common_tags, {
    Name = "${var.project}-${var.stage}-vpc"
  })
}

# ---------- Public Subnet (AZ a — for EC2) ----------

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = local.az_a
  map_public_ip_on_launch = true

  tags = merge(local.common_tags, {
    Name = "${var.project}-${var.stage}-public-a"
    Tier = "public"
  })
}

# ---------- Private Subnets (AZ a + AZ b — for RDS subnet group) ----------

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.this.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = local.az_a

  tags = merge(local.common_tags, {
    Name = "${var.project}-${var.stage}-private-a"
    Tier = "private"
  })
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.this.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = local.az_b

  tags = merge(local.common_tags, {
    Name = "${var.project}-${var.stage}-private-b"
    Tier = "private"
  })
}

# ---------- Internet Gateway ----------

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = merge(local.common_tags, {
    Name = "${var.project}-${var.stage}-igw"
  })
}

# ---------- Public Route Table ----------

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = merge(local.common_tags, {
    Name = "${var.project}-${var.stage}-public-rt"
  })
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}
