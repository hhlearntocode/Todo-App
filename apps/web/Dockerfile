FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml ./

# Copy web package files
COPY apps/web/package.json apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy web source code
COPY apps/web apps/web/

# Build the application
RUN cd apps/web && pnpm build

# Production stage with nginx
FROM nginx:alpine AS production

# Copy built files
COPY --from=base /app/apps/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
