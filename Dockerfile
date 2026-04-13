FROM node:20-slim AS base

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
# Create temp DB so Next.js build can analyze API routes without failing
COPY . .
RUN mkdir -p /data && DATABASE_URL=/data/build.db npm run build && rm -f /data/build.db

# Production
FROM node:20-slim AS runner
WORKDIR /app

RUN mkdir -p /data

COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./
COPY --from=base /app/tsconfig.json ./
COPY --from=base /app/src ./src
COPY --from=base /app/scripts ./scripts

ENV NODE_ENV=production
ENV DATABASE_URL=/data/pesca.db

EXPOSE 3000

CMD ["npm", "run", "start"]
