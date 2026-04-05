#!/bin/sh
# Copy static assets into standalone output for Render deployment
cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static 2>/dev/null || true
cp -r apps/web/public apps/web/.next/standalone/apps/web/public 2>/dev/null || true

# Run database migrations
node packages/design-core/src/db/migrate-prod.js 2>/dev/null || echo "Migration skipped (may already be applied)"

# Start the server
exec node apps/web/.next/standalone/apps/web/server.js
