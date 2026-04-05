#!/bin/bash
# ============================================================================
# AIUI — One-command AWS Free Tier Deployment
# ============================================================================
# Prerequisites:
#   1. AWS CLI installed + configured (aws configure)
#   2. Neon database created (https://neon.tech — free)
#   3. Set these environment variables before running:
#
#      export DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require"
#      export JWT_SECRET="$(openssl rand -base64 32)"
#
# Usage:
#   chmod +x scripts/aws-deploy.sh
#   ./scripts/aws-deploy.sh
# ============================================================================

set -euo pipefail

# --- Configuration ---
INSTANCE_TYPE="t2.micro"
REGION="${AWS_REGION:-us-east-1}"
KEY_NAME="${AWS_KEY_NAME:-aiui-key}"
APP_NAME="aiui"

# --- Validate ---
if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: Set DATABASE_URL environment variable (Neon connection string)"
  echo "  export DATABASE_URL=\"postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require\""
  exit 1
fi

if [ -z "${JWT_SECRET:-}" ]; then
  echo "Generating JWT_SECRET..."
  JWT_SECRET=$(openssl rand -base64 32)
  echo "JWT_SECRET=$JWT_SECRET"
fi

echo ""
echo "  AIUI AWS Free Tier Deployment"
echo "  =============================="
echo "  Region:   $REGION"
echo "  Instance: $INSTANCE_TYPE (free tier)"
echo "  Database: Neon (external)"
echo ""

# --- Create key pair if it doesn't exist ---
if ! aws ec2 describe-key-pairs --key-names "$KEY_NAME" --region "$REGION" &>/dev/null; then
  echo "Creating SSH key pair: $KEY_NAME"
  aws ec2 create-key-pair \
    --key-name "$KEY_NAME" \
    --region "$REGION" \
    --query "KeyMaterial" \
    --output text > "${KEY_NAME}.pem"
  chmod 400 "${KEY_NAME}.pem"
  echo "  Saved to ${KEY_NAME}.pem"
fi

# --- Create security group ---
SG_NAME="${APP_NAME}-sg"
SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=$SG_NAME" \
  --region "$REGION" \
  --query "SecurityGroups[0].GroupId" \
  --output text 2>/dev/null || echo "None")

if [ "$SG_ID" = "None" ] || [ -z "$SG_ID" ]; then
  echo "Creating security group: $SG_NAME"
  SG_ID=$(aws ec2 create-security-group \
    --group-name "$SG_NAME" \
    --description "AIUI MCP Server + Web" \
    --region "$REGION" \
    --output text --query "GroupId")

  # Allow HTTP (80), HTTPS (443), MCP (8080), SSH (22)
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --region "$REGION" \
    --ip-permissions \
    "IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges=[{CidrIp=0.0.0.0/0}]" \
    "IpProtocol=tcp,FromPort=443,ToPort=443,IpRanges=[{CidrIp=0.0.0.0/0}]" \
    "IpProtocol=tcp,FromPort=8080,ToPort=8080,IpRanges=[{CidrIp=0.0.0.0/0}]" \
    "IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges=[{CidrIp=0.0.0.0/0}]" \
    &>/dev/null
  echo "  Security group: $SG_ID"
fi

# --- User data script (runs on first boot) ---
USER_DATA=$(cat <<'USERDATA'
#!/bin/bash
set -e

# Install Docker
yum update -y
yum install -y docker git
systemctl enable docker
systemctl start docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js 20 (for schema push + seed)
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs
npm install -g pnpm@9

# Clone the repo
cd /opt
git clone https://gitlab.com/dkumar70/AIUI.git aiui
cd aiui

# Create .env from instance metadata
cat > .env <<ENV
DATABASE_URL=__DATABASE_URL__
JWT_SECRET=__JWT_SECRET__
MCP_SERVER_PORT=8080
AIUI_WEB_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000
NODE_ENV=production
ENV

# Push schema + seed (using Neon)
pnpm install --frozen-lockfile
pnpm build
DATABASE_URL="__DATABASE_URL__" pnpm --filter @aiui/design-core db:push || true
DATABASE_URL="__DATABASE_URL__" pnpm --filter @aiui/design-core seed || true

# Build Docker images and start
docker-compose -f docker-compose.yml up -d --build mcp-server web

echo "AIUI deployed successfully!" > /tmp/aiui-deploy-status
USERDATA
)

# Replace placeholders with actual values
USER_DATA="${USER_DATA//__DATABASE_URL__/$DATABASE_URL}"
USER_DATA="${USER_DATA//__DATABASE_URL__/$DATABASE_URL}"
USER_DATA="${USER_DATA//__DATABASE_URL__/$DATABASE_URL}"
USER_DATA="${USER_DATA//__JWT_SECRET__/$JWT_SECRET}"

# --- Find latest Amazon Linux 2023 AMI ---
AMI_ID=$(aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-2023.*-x86_64" "Name=state,Values=available" \
  --region "$REGION" \
  --query "sort_by(Images, &CreationDate)[-1].ImageId" \
  --output text)

echo "Using AMI: $AMI_ID"

# --- Launch instance ---
echo "Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id "$AMI_ID" \
  --instance-type "$INSTANCE_TYPE" \
  --key-name "$KEY_NAME" \
  --security-group-ids "$SG_ID" \
  --user-data "$USER_DATA" \
  --region "$REGION" \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$APP_NAME}]" \
  --query "Instances[0].InstanceId" \
  --output text)

echo "  Instance: $INSTANCE_ID"
echo "  Waiting for public IP..."

# Wait for IP
sleep 10
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --region "$REGION" \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text)

echo ""
echo "  ========================================="
echo "  AIUI Deployed!"
echo "  ========================================="
echo ""
echo "  Web App:    http://$PUBLIC_IP:3000"
echo "  MCP Server: http://$PUBLIC_IP:8080"
echo "  Health:     http://$PUBLIC_IP:8080/health"
echo "  Quick Setup: http://$PUBLIC_IP:3000/quick-setup"
echo ""
echo "  SSH: ssh -i ${KEY_NAME}.pem ec2-user@$PUBLIC_IP"
echo ""
echo "  MCP Setup (Claude Code):"
echo "  claude mcp add --transport http aiui http://$PUBLIC_IP:8080/mcp --header \"Authorization:Bearer YOUR_API_KEY\""
echo ""
echo "  Note: Instance takes 3-5 minutes to fully start."
echo "  Check progress: ssh -i ${KEY_NAME}.pem ec2-user@$PUBLIC_IP 'cat /tmp/aiui-deploy-status'"
echo ""
