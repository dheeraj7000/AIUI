# Deploy to Railway

## One-Click Deploy

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template)

## Manual Setup

1. Install the Railway CLI:

```bash
npm install -g @railway/cli
railway login
```

2. Create a new project:

```bash
railway init
```

3. Add PostgreSQL:

```bash
railway add --plugin postgresql
```

4. Set environment variables:

```bash
railway variables set JWT_SECRET="your-secret-min-32-chars"
railway variables set MCP_SERVER_PORT="8080"
railway variables set NODE_ENV="production"
```

5. Deploy the MCP server:

```bash
railway up --service mcp-server
```

6. Get your URL:

```bash
railway open
```

## Verify

```bash
curl https://your-app.railway.app/health
```

## Notes

- Railway auto-provisions `DATABASE_URL` from the PostgreSQL plugin
- Free tier: 500 hours/month, 1 GB RAM
- Pro tier: $5/month, unlimited hours
