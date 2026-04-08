terraform {
  backend "s3" {
    bucket         = "aiui-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "aiui-terraform-lock"
    encrypt        = true
  }
}
