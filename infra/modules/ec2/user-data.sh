#!/bin/bash
set -euo pipefail

exec > /var/log/aiui-setup.log 2>&1
echo "=== AIUI EC2 Setup Started: $(date) ==="

# --- Install Docker ---
dnf update -y
dnf install -y docker git
systemctl enable docker
systemctl start docker

# Install Docker Compose plugin
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Add ec2-user to docker group
usermod -aG docker ec2-user

# --- Fetch secrets from SSM Parameter Store ---
REGION="${aws_region}"
PROJECT="${project_name}"

DATABASE_URL=$(aws ssm get-parameter \
  --name "/$PROJECT/database-url" \
  --with-decryption \
  --region "$REGION" \
  --query "Parameter.Value" \
  --output text)

JWT_SECRET=$(aws ssm get-parameter \
  --name "/$PROJECT/jwt-secret" \
  --with-decryption \
  --region "$REGION" \
  --query "Parameter.Value" \
  --output text)

# --- Create application directory ---
mkdir -p /opt/aiui
cd /opt/aiui

# Clone repo for compose files
git clone https://gitlab.com/dkumar70/AIUI.git .

# --- Write environment file ---
cat > .env <<ENV
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
MCP_SERVER_PORT=8080
MCP_CORS_ORIGINS=*
MCP_RATE_LIMIT=60
POSTGRES_PASSWORD=unused-external-db
ECR_REGISTRY=${ecr_registry}
ENV

# --- Login to ECR ---
aws ecr get-login-password --region "$REGION" | \
  docker login --username AWS --password-stdin "${ecr_registry}"

# --- Pull images and start services ---
docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  -f docker-compose.aws.yml \
  pull

docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  -f docker-compose.aws.yml \
  up -d mcp-server web

# --- Create systemd service for auto-restart on reboot ---
cat > /etc/systemd/system/aiui.service <<'SERVICE'
[Unit]
Description=AIUI Docker Compose
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/aiui
ExecStartPre=/bin/bash -c 'aws ecr get-login-password --region ${aws_region} | docker login --username AWS --password-stdin ${ecr_registry}'
ExecStart=/usr/bin/docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.aws.yml up -d mcp-server web
ExecStop=/usr/bin/docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.aws.yml down

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable aiui.service

echo "=== AIUI EC2 Setup Complete: $(date) ==="
echo "READY" > /tmp/aiui-deploy-status
