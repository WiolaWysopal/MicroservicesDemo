# Etap 1: builder
FROM node:20-alpine AS builder

WORKDIR /app

# Zainstaluj niezbędne narzędzia
RUN apk add --no-cache bash git python3 make g++ libc6-compat openssl

# Kopiujemy root package.json i nx config
COPY package*.json nx.json tsconfig.base.json ./

# Instalacja root dependencies (Nx, Prisma)
RUN npm install --legacy-peer-deps

# Kopiujemy serwis i shared libs
COPY apps/products-service ./apps/products-service
COPY libs/shared-interfaces ./libs/shared-interfaces

# Generujemy Prisma Client
WORKDIR /app/apps/products-service
RUN npx prisma generate

# Budujemy Typescript serwisu
RUN npx nx build products-service --prod

# Etap 2: produkcyjny obraz minimalny
FROM node:20-alpine AS production

WORKDIR /app

# Kopiujemy node_modules i build
COPY --from=builder /app/apps/products-service/node_modules ./node_modules
COPY --from=builder /app/apps/products-service/dist ./dist

WORKDIR /app/dist

EXPOSE 3001

CMD ["node", "main.js"]
