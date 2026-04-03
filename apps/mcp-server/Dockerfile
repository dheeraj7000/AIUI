FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/mcp-server/package.json apps/mcp-server/
COPY packages/types/package.json packages/types/
COPY packages/design-core/package.json packages/design-core/
COPY packages/prompt-compiler/package.json packages/prompt-compiler/
COPY packages/component-engine/package.json packages/component-engine/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @aiui/mcp-server build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/mcp-server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 8080
CMD ["node", "dist/index.js"]
