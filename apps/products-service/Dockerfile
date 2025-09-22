# Etap budowania
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json nx.json ./
COPY apps/products-service/package*.json ./apps/products-service/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npx nx run @microservices-demo/products-service:build

# Etap uruchamiania
FROM node:18-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/apps/products-service/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

ENV DATABASE_URL="file:./prisma/products.db"

EXPOSE 3000
CMD ["node", "dist/main.js"]
