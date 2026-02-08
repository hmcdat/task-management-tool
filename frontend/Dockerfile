FROM node:24-alpine AS base

ENV NODE_ENV=production
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat \
    && npm install -g pnpm

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

FROM base AS deps
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
ENV NODE_ENV=production

COPY prisma ./prisma
RUN pnpm prisma generate

COPY . .
RUN pnpm run build

FROM deps AS prod-deps
ENV NODE_ENV=production
RUN pnpm prune --prod

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY package.json pnpm-lock.yaml ./

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
