# Multi-stage production Dockerfile for Google Cloud Run
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json tsconfig.json ./

# Install all dependencies including devDependencies for TypeScript build
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY scripts/ ./scripts/

# Compile TypeScript
RUN npm run build

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled files from builder stage
COPY --from=builder /app/dist ./dist

# Non-root user for security
USER node

EXPOSE 8080

CMD ["node", "dist/index.js"]
