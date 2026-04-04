#!/bin/bash
set -euo pipefail

echo "=== AIUI Terraform Deployment ==="
echo ""

# Check prerequisites
command -v terraform >/dev/null 2>&1 || { echo "ERROR: terraform not found. Install: https://developer.hashicorp.com/terraform/install"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "ERROR: aws cli not found. Install: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"; exit 1; }

# Check AWS credentials
aws sts get-caller-identity >/dev/null 2>&1 || { echo "ERROR: AWS credentials not configured. Run: aws configure"; exit 1; }

echo "AWS Account: $(aws sts get-caller-identity --query Account --output text)"
echo "Region: $(grep -E '^\s*region' terraform.tfvars 2>/dev/null | head -1 | cut -d'"' -f2 || echo 'us-east-1')"
echo ""

# Check tfvars
if [ ! -f terraform.tfvars ]; then
  echo "ERROR: terraform.tfvars not found."
  echo "Run: cp terraform.tfvars.example terraform.tfvars"
  echo "Then edit terraform.tfvars with your values."
  exit 1
fi

# Init
echo ">>> terraform init"
terraform init

# Plan
echo ""
echo ">>> terraform plan"
terraform plan -out=tfplan

echo ""
read -p "Apply this plan? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

# Apply
echo ""
echo ">>> terraform apply"
terraform apply tfplan

echo ""
echo "=== Deployment Complete ==="
echo ""
terraform output

echo ""
echo "=== Next Steps ==="
echo "1. Wait 3-5 minutes for EC2 to build Docker images"
echo "2. Check bootstrap progress: aws ssm start-session --target \$(terraform output -raw ec2_instance_id 2>/dev/null || echo 'INSTANCE_ID') then: tail -f /var/log/user_data.log"
echo "3. Access web app: \$(terraform output -raw web_url)"
echo "4. Access MCP server: \$(terraform output -raw mcp_url)"
echo "5. HTTPS via CloudFront: \$(terraform output -raw cloudfront_url)"
