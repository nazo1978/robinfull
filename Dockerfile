FROM node:18-alpine AS base

# Bağımlılıkları yüklemek için temel katman
FROM base AS deps
WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY package.json package-lock.json ./

# Bağımlılıkları yükle
RUN npm ci

# Geliştirme için kullanılacak katman
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js uygulamasını derle
RUN npm run build

# Üretim için kullanılacak katman
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Kullanıcı oluştur
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Next.js uygulamasının derlenen dosyalarını kopyala
COPY --from=builder /app/public ./public

# Standalone çıktısını kullan
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Uygulamayı başlat
CMD ["node", "server.js"] 