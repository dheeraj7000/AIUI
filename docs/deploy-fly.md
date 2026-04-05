# Deploy to Fly.io

## Setup

1. Install the Fly CLI:

```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

2. Launch the MCP server app:

```bash
fly launch --name aiui-mcp --dockerfile apps/mcp-server/Dockerfile
```

3. Create a Postgres database:

```bash
fly postgres create --name aiui-db
fly postgres attach aiui-db --app aiui-mcp
```

4. Set secrets:

```bash
fly secrets set JWT_SECRET="your-secret-min-32-chars" --app aiui-mcp
fly secrets set MCP_SERVER_PORT="8080" --app aiui-mcp
```

5. Deploy:

```bash
fly deploy --app aiui-mcp
```

## fly.toml

```toml
app = "aiui-mcp"
primary_region = "iad"

[build]
  dockerfile = "apps/mcp-server/Dockerfile"

[env]
  MCP_SERVER_PORT = "8080"
  NODE_ENV = "production"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false
  min_machines_running = 1

[[vm]]
  size = "shared-cpu-1x"
  memory = "512mb"
```

## Verify

```bash
curl https://aiui-mcp.fly.dev/health
```

## Notes

- Fly auto-sets `DATABASE_URL` when you attach Postgres
- Free tier: 3 shared VMs, 256 MB each
- Hobby tier: $5/month for more resources
