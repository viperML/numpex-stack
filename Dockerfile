# Use Alpine Linux with Node.js
FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the Astro application
RUN pnpm run build

ENV NODE_ENV production
EXPOSE 8080
ENV PORT 8080
ENV HOST 0.0.0.0

# Start the server using the standalone entry point
CMD ["node", "dist/server/entry.mjs"]