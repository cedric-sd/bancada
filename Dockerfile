# syntax=docker/dockerfile:1

# ---- Base ----
# Alpine enxuta com Node 22 (mesma major usada no desenvolvimento).
FROM node:22-alpine AS base
# libc6-compat ajuda algumas dependências nativas a rodarem no Alpine.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---- Dependências ----
# Camada isolada para aproveitar cache enquanto package*.json não mudam.
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Build ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Runner (produção) ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Usuário não-root por segurança.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Saída standalone: server + apenas as deps necessárias.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# O server.js é gerado pelo build standalone do Next.js.
CMD ["node", "server.js"]
