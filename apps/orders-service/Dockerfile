# Stage 1: build
FROM node:18-alpine AS builder
RUN apk add --no-cache bash libc6-compat git python3 make g++ openssl

WORKDIR /app

# Kopiowanie root package.json + lockfile + tsconfig
COPY package*.json nx.json tsconfig.base.json ./

# Instalacja TypeScript globalnie
RUN npm install -g typescript

# Kopiowanie package.json serwisu
COPY apps/orders-service/package*.json ./apps/orders-service/

# Instalacja wszystkich dependencies (dev + prod)
RUN npm install --legacy-peer-deps --prefix ./apps/orders-service

# Kopiowanie kodu źródłowego i wspólnych bibliotek Nx
COPY apps/orders-service ./apps/orders-service
COPY libs/shared-interfaces ./libs/shared-interfaces

# Kompilacja TypeScript
WORKDIR /app/apps/orders-service
RUN tsc

# Stage 2: production
FROM node:18-alpine AS production
WORKDIR /app

# Kopiowanie całego node_modules z buildera
COPY --from=builder /app/apps/orders-service/node_modules ./node_modules

# Kopiowanie skompilowanego kodu
COPY --from=builder /app/apps/orders-service/dist ./dist

ENV PORT=3001
EXPOSE 3001

CMD ["node", "dist/main.js"]
