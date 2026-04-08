aws_region    = "us-east-1"
project_name  = "aiui"
instance_type = "t3.micro"

# GitLab OIDC — update with your GitLab group/username and project path
gitlab_group   = "dkumar70"
gitlab_project = "dkumar70/AIUI"

# Domain + HTTPS
domain_name = "aiui.store"

# Restrict SSH to your IP (replace with your IP/32)
# ssh_allowed_cidr = "1.2.3.4/32"

# Secrets — pass via CLI or environment:
#   terraform apply -var="database_url=postgresql://..." -var="jwt_secret=..."
# Or set TF_VAR_database_url and TF_VAR_jwt_secret environment variables
