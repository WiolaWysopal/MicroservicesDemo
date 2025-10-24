# Etap 1: builder
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache bash git python3 make g++ libc6-compat openssl

COPY package*.json nx.json tsconfig.base.json ./

RUN npm install --legacy-peer-deps

COPY apps/orders-service ./apps/orders-service
COPY libs/shared-interfaces ./libs/shared-interfaces

WORKDIR /app/apps/orders-service
RUN npx prisma generate
RUN npx nx build orders-service --prod

# Etap 2: produkcyjny obraz minimalny
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/apps/orders-service/node_modules ./node_modules
COPY --from=builder /app/apps/orders-service/dist ./dist

WORKDIR /app/dist

EXPOSE 3002

CMD ["node", "main.js"]
