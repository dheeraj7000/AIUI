#!/bin/bash
set -e

echo "🚀 Starting AIUI local setup..."

echo "📦 Starting PostgreSQL via Docker..."
docker compose up -d postgres

echo "⏳ Waiting for PostgreSQL to be ready..."
# Wait up to 30 seconds for the database to be ready
for i in {1..30}; do
  if docker compose exec postgres pg_isready -U aiui -d aiui > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready!"
    break
  fi
  echo -n "."
  sleep 1
done

if ! docker compose exec postgres pg_isready -U aiui -d aiui > /dev/null 2>&1; then
  echo "❌ Error: PostgreSQL failed to start in time."
  exit 1
fi

echo "🔄 Pushing database schema..."
export DATABASE_URL="postgresql://aiui:aiui@127.0.0.1:5432/aiui"
pnpm --filter @aiui/design-core db:push

echo "📄 Generating MCP server catalog..."
pnpm --filter @aiui/web gen:catalog

echo "🎉 Setup complete! You can now run 'pnpm dev' to start the application."
