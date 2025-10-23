# Stage 1: build
FROM node:18-alpine AS builder
RUN apk add --no-cache bash libc6-compat git python3 make g++ openssl

WORKDIR /app

# Kopiowanie root package.json + lockfile + tsconfig
COPY package*.json nx.json tsconfig.base.json ./

# Instalacja wszystkich dependencies (dev + prod)
RUN npm install --legacy-peer-deps

# Kopiowanie kodu serwisu i Prisma
COPY apps/products-service ./apps/products-service
COPY apps/products-service/prisma ./apps/products-service/prisma

# Generowanie Prisma Client
WORKDIR /app/apps/products-service
RUN npx prisma generate --schema=prisma/schema.prisma

# Kompilacja TypeScript / build Webpack (jeśli używasz Nx build)
RUN npx nx build products-service --prod

# Stage 2: production
FROM node:18-alpine AS production
WORKDIR /app

# Kopiowanie całego node_modules z root
COPY --from=builder /app/node_modules ./node_modules

# Kopiowanie skompilowanego kodu
COPY --from=builder /app/dist/apps/products-service ./dist

# Kopiowanie Prisma Client
COPY --from=builder /app/apps/products-service/prisma ./prisma

ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/main.js"]
