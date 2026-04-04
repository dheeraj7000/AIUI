#!/bin/bash
set -euo pipefail

# Log everything
exec > /var/log/user_data.log 2>&1
echo "=== AIUI Bootstrap Start: $(date) ==="

# --- Install Docker ---
dnf update -y
dnf install -y docker git
systemctl enable docker
systemctl start docker

# Install docker-compose plugin
DOCKER_COMPOSE_VERSION="v2.29.1"
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/download/$${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# --- Install Node.js 20 (for building) ---
dnf install -y nodejs20 npm

# Enable corepack + pnpm
corepack enable
corepack prepare pnpm@9 --activate

# --- Clone and build ---
cd /opt
git clone https://github.com/dkumar70/AIUI.git aiui || true
cd /opt/aiui

# Build Docker images locally on the instance
docker build -f apps/web/Dockerfile -t aiui-web:latest .
docker build -f apps/mcp-server/Dockerfile -t aiui-mcp:latest .

# --- Create environment file ---
cat > /opt/aiui/.env.production <<'ENVEOF'
NODE_ENV=production
DATABASE_URL=postgresql://${db_username}:${db_password}@${db_host}:${db_port}/${db_name}
JWT_SECRET=${jwt_secret}
NEXT_PUBLIC_COGNITO_USER_POOL_ID=${cognito_pool_id}
NEXT_PUBLIC_COGNITO_CLIENT_ID=${cognito_client_id}
NEXT_PUBLIC_COGNITO_REGION=${cognito_region}
S3_ASSETS_BUCKET=${s3_assets_bucket}
S3_BUNDLES_BUCKET=${s3_bundles_bucket}
S3_PREVIEWS_BUCKET=${s3_previews_bucket}
MCP_SERVER_PORT=8080
MCP_CORS_ORIGINS=*
ENVEOF

# --- Create docker-compose ---
cat > /opt/aiui/docker-compose.prod.yml <<'COMPOSEEOF'
services:
  web:
    image: aiui-web:latest
    container_name: aiui-web
    restart: unless-stopped
    ports:
      - "80:3000"
    env_file:
      - .env.production
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  mcp:
    image: aiui-mcp:latest
    container_name: aiui-mcp
    restart: unless-stopped
    ports:
      - "8080:8080"
    env_file:
      - .env.production
    environment:
      - AIUI_WEB_URL=http://localhost:3000
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:8080/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
COMPOSEEOF

# --- Start services ---
cd /opt/aiui
docker compose -f docker-compose.prod.yml up -d

# --- Init database extensions ---
# Wait for containers to be healthy, then run migrations if needed
sleep 10
echo "=== AIUI Bootstrap Complete: $(date) ==="
