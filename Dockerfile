FROM node:20-slim AS base

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production
FROM node:20-slim AS runner
WORKDIR /app

RUN mkdir -p /data

COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./
COPY --from=base /app/src ./src
COPY --from=base /app/scripts ./scripts
COPY --from=base /app/drizzle ./drizzle

ENV NODE_ENV=production
ENV DATABASE_URL=/data/pesca.db

EXPOSE 3000

CMD ["npm", "run", "start"]
