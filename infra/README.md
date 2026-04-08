# AIUI AWS Infrastructure

Terraform-managed AWS infrastructure for AIUI. Deploys to the AWS Free Tier ($0/month for 12 months).

## Architecture

```
Internet → ALB (HTTP:80) → EC2 t3.micro (Docker Compose)
                              ├── aiui-web    (:3000)
                              └── aiui-mcp    (:8080)

Neon (external) → PostgreSQL
SSM Parameter Store → Secrets
ECR → Container images
```

## Prerequisites

- AWS CLI configured (`aws configure`)
- Terraform >= 1.5 installed
- Neon database created (https://neon.tech)
- GitLab repository set up

## Bootstrap (one-time setup)

### 1. Create Terraform state backend

```bash
aws s3 mb s3://aiui-terraform-state --region us-east-1

aws dynamodb create-table \
  --table-name aiui-terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 2. Set secrets

```bash
# Your Neon connection string
export TF_VAR_database_url="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require"

# Generate a JWT secret
export TF_VAR_jwt_secret="$(openssl rand -base64 32)"
```

### 3. Deploy

```bash
cd infra

terraform init
terraform plan -var-file=environments/prod.tfvars
terraform apply -var-file=environments/prod.tfvars
```

### 4. Push initial Docker images

After `terraform apply`, push images to ECR before the EC2 instance can start:

```bash
# Get ECR registry from terraform output
ECR_REGISTRY=$(terraform output -raw ecr_web_url | cut -d/ -f1)

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY

# Build and push (from repo root)
cd ..
docker build -f apps/web/Dockerfile -t $ECR_REGISTRY/aiui-web:latest .
docker build -f apps/mcp-server/Dockerfile -t $ECR_REGISTRY/aiui-mcp:latest .
docker push $ECR_REGISTRY/aiui-web:latest
docker push $ECR_REGISTRY/aiui-mcp:latest
```

### 5. Verify

```bash
cd infra

# Get the ALB URL
terraform output web_url

# Check health
curl $(terraform output -raw web_url)/api/health
curl $(terraform output -raw health_url)
```

## CI/CD

The deploy pipeline (`.gitlab-ci.yml`) runs automatically after tests pass on main.

**Required GitLab CI/CD variables** (Settings > CI/CD > Variables):

- `AWS_DEPLOY_ROLE_ARN` — from `terraform output gitlab_deploy_role_arn`
- `ECR_REGISTRY` — from `terraform output ecr_web_url | cut -d/ -f1`

## Manual Deploy Pipeline (commit → rebuild → deploy)

When you make code changes and want to deploy manually:

```bash
# 1. Commit and push
git add -A
git commit -m "your change"
git push origin main

# 2. Login to ECR
ECR_REGISTRY=731732766290.dkr.ecr.us-east-1.amazonaws.com
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY

# 3. Rebuild images (from repo root)
docker build -f apps/web/Dockerfile -t $ECR_REGISTRY/aiui-web:latest .
docker build -f apps/mcp-server/Dockerfile -t $ECR_REGISTRY/aiui-mcp:latest .

# 4. Push to ECR
docker push $ECR_REGISTRY/aiui-web:latest
docker push $ECR_REGISTRY/aiui-mcp:latest

# 5. Deploy to EC2 (pulls new images and restarts)
ssh -i infra/aiui-key.pem ec2-user@$(cd infra && terraform output -raw ec2_public_ip) \
  "cd /opt/aiui && \
   sudo git pull origin main && \
   sudo aws ecr get-login-password --region us-east-1 | sudo docker login --username AWS --password-stdin $ECR_REGISTRY && \
   sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.aws.yml pull web mcp-server && \
   sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.aws.yml up -d web mcp-server"

# 6. Verify
curl -sf https://aiui.store/api/health
curl -sf https://aiui.store/health
```

Once GitLab CI/CD variables are set, pushes to `main` will auto-deploy via `.gitlab-ci.yml`.

## SSH Access

```bash
# From the infra/ directory
ssh -i aiui-key.pem ec2-user@$(terraform output -raw ec2_public_ip)
```

## Useful Commands

```bash
# View container status (on EC2)
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.aws.yml ps

# View logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.aws.yml logs -f

# Restart services
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.aws.yml restart

# Manual redeploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.aws.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.aws.yml up -d mcp-server web
```

## Cost

| Service             | Free Tier | After 12 months |
| ------------------- | --------- | --------------- |
| EC2 t3.micro        | $0        | ~$8/month       |
| ALB                 | $0        | ~$18/month      |
| ECR (500 MB)        | $0        | $0              |
| SSM Parameter Store | $0        | $0              |
| CloudWatch (5 GB)   | $0        | $0              |
| Neon                | $0        | $0              |
| **Total**           | **$0**    | **~$26/month**  |

## Tear Down

```bash
terraform destroy -var-file=environments/prod.tfvars
```
