terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project   = var.project
      Stage     = var.stage
      ManagedBy = "terraform"
    }
  }
}

# --- VPC ---
module "vpc" {
  source  = "./modules/vpc"
  project = var.project
  stage   = var.stage
  region  = var.region
}

# --- Security Groups ---
module "security_groups" {
  source     = "./modules/security-groups"
  project    = var.project
  stage      = var.stage
  vpc_id     = module.vpc.vpc_id
  enable_ssh = var.ec2_key_name != ""
}

# --- IAM ---
module "iam" {
  source         = "./modules/iam"
  project        = var.project
  stage          = var.stage
  s3_bucket_arns = module.s3.all_bucket_arns
}

# --- RDS ---
module "rds" {
  source             = "./modules/rds"
  project            = var.project
  stage              = var.stage
  private_subnet_ids = module.vpc.private_subnet_ids
  rds_sg_id          = module.security_groups.rds_sg_id
  db_name            = var.db_name
  db_username        = var.db_username
  db_password        = var.db_password
}

# --- S3 ---
module "s3" {
  source  = "./modules/s3"
  project = var.project
  stage   = var.stage
}

# --- Cognito ---
module "cognito" {
  source  = "./modules/cognito"
  project = var.project
  stage   = var.stage
}

# --- EC2 ---
module "ec2" {
  source                = "./modules/ec2"
  project               = var.project
  stage                 = var.stage
  vpc_id                = module.vpc.vpc_id
  subnet_id             = module.vpc.public_subnet_id
  ec2_sg_id             = module.security_groups.ec2_sg_id
  instance_profile_name = module.iam.instance_profile_name
  key_name              = var.ec2_key_name
  db_host               = module.rds.db_host
  db_port               = tostring(module.rds.db_port)
  db_name               = var.db_name
  db_username           = var.db_username
  db_password           = var.db_password
  jwt_secret            = var.jwt_secret
  cognito_user_pool_id  = module.cognito.user_pool_id
  cognito_client_id     = module.cognito.client_id
  cognito_region        = var.region
  s3_assets_bucket      = module.s3.assets_bucket_name
  s3_bundles_bucket     = module.s3.bundles_bucket_name
  s3_previews_bucket    = module.s3.previews_bucket_name
}

# --- CloudFront ---
module "cloudfront" {
  source                    = "./modules/cloudfront"
  project                   = var.project
  stage                     = var.stage
  assets_bucket_domain_name = module.s3.assets_bucket_domain_name
  assets_bucket_id          = module.s3.assets_bucket_id
  assets_bucket_arn         = module.s3.assets_bucket_arn
  ec2_public_dns            = module.ec2.public_ip
}
