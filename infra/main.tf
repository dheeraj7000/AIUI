terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = var.project_name
      ManagedBy = "terraform"
    }
  }
}

# --- Data Sources ---
data "aws_caller_identity" "current" {}

data "aws_availability_zones" "available" {
  state = "available"
}

# --- Modules ---

module "networking" {
  source = "./modules/networking"

  project_name       = var.project_name
  availability_zones = slice(data.aws_availability_zones.available.names, 0, 2)
  ssh_allowed_cidr   = var.ssh_allowed_cidr
}

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
}

module "iam" {
  source = "./modules/iam"

  project_name    = var.project_name
  aws_region      = var.aws_region
  aws_account_id  = data.aws_caller_identity.current.account_id
  gitlab_group    = var.gitlab_group
  gitlab_project  = var.gitlab_project
  ecr_web_arn     = module.ecr.web_repository_arn
  ecr_mcp_arn     = module.ecr.mcp_repository_arn
}

module "ssm" {
  source = "./modules/ssm"

  project_name = var.project_name
  database_url = var.database_url
  jwt_secret   = var.jwt_secret
}

module "alb" {
  source = "./modules/alb"

  project_name      = var.project_name
  vpc_id            = module.networking.vpc_id
  subnet_ids        = module.networking.public_subnet_ids
  security_group_id = module.networking.alb_security_group_id
}

module "ec2" {
  source = "./modules/ec2"

  project_name          = var.project_name
  instance_type         = var.instance_type
  subnet_id             = module.networking.public_subnet_ids[0]
  security_group_id     = module.networking.ec2_security_group_id
  instance_profile_name = module.iam.ec2_instance_profile_name
  web_target_group_arn  = module.alb.web_target_group_arn
  mcp_target_group_arn  = module.alb.mcp_target_group_arn
  aws_region            = var.aws_region
  ecr_registry          = split("/", module.ecr.web_repository_url)[0]
}
