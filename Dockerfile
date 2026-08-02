# Step 1: Base Image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Step 2: Install dependencies
# Copy package manifests first for efficient Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Step 3: Copy application source code
COPY . .

# Ensure persistent data directory exists and set proper permissions
RUN mkdir -p /app/data && chown -R node:node /app

# Switch to non-root user for enhanced security
USER node

# Expose port 3000
EXPOSE 3000

# Mountable volume for data persistence (db.json)
VOLUME ["/app/data"]

# Start the application
CMD ["npm", "start"]
