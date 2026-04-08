FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate

# -- Install dependencies --
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/mcp-server/package.json apps/mcp-server/
COPY packages/types/package.json packages/types/
COPY packages/design-core/package.json packages/design-core/
COPY packages/prompt-compiler/package.json packages/prompt-compiler/
COPY packages/component-engine/package.json packages/component-engine/
RUN pnpm install --frozen-lockfile

# -- Build all workspace packages --
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @aiui/mcp-server... build

# -- Production dependencies only --
FROM base AS prod-deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/mcp-server/package.json apps/mcp-server/
COPY packages/types/package.json packages/types/
COPY packages/design-core/package.json packages/design-core/
COPY packages/prompt-compiler/package.json packages/prompt-compiler/
COPY packages/component-engine/package.json packages/component-engine/
RUN pnpm install --frozen-lockfile --prod --ignore-scripts && pnpm rebuild sharp 2>/dev/null || true

# -- Runner --
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV MCP_SERVER_PORT=8080

# Non-root user
RUN addgroup --system --gid 1001 aiui && \
    adduser --system --uid 1001 --ingroup aiui aiui

# Copy package.json files for module resolution
COPY --from=prod-deps --chown=aiui:aiui /app/package.json ./package.json
COPY --from=prod-deps --chown=aiui:aiui /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=prod-deps --chown=aiui:aiui /app/apps/mcp-server/package.json ./apps/mcp-server/package.json
COPY --from=prod-deps --chown=aiui:aiui /app/packages/types/package.json ./packages/types/package.json
COPY --from=prod-deps --chown=aiui:aiui /app/packages/design-core/package.json ./packages/design-core/package.json
COPY --from=prod-deps --chown=aiui:aiui /app/packages/prompt-compiler/package.json ./packages/prompt-compiler/package.json
COPY --from=prod-deps --chown=aiui:aiui /app/packages/component-engine/package.json ./packages/component-engine/package.json

# Copy production deps (root + workspace node_modules)
COPY --from=prod-deps --chown=aiui:aiui /app/node_modules ./node_modules
COPY --from=prod-deps --chown=aiui:aiui /app/apps/mcp-server/node_modules ./apps/mcp-server/node_modules

# Copy built artifacts
COPY --from=builder --chown=aiui:aiui /app/apps/mcp-server/dist ./apps/mcp-server/dist
COPY --from=builder --chown=aiui:aiui /app/packages/types/dist ./packages/types/dist
COPY --from=builder --chown=aiui:aiui /app/packages/design-core/dist ./packages/design-core/dist
COPY --from=builder --chown=aiui:aiui /app/packages/prompt-compiler/dist ./packages/prompt-compiler/dist
COPY --from=builder --chown=aiui:aiui /app/packages/component-engine/dist ./packages/component-engine/dist

USER aiui
EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["node", "apps/mcp-server/dist/index.js"]
