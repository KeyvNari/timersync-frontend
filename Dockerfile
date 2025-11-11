# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built dist folder from builder
COPY --from=builder /app/dist ./dist

# Copy server file
COPY server.js ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "import('http').then(http => http.get('http://localhost:8080', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)}))" || exit 1

# Start the application
CMD ["npm", "start"]
