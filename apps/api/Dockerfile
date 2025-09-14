FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml ./

# Copy API package files
COPY apps/api/package.json apps/api/
COPY apps/api/prisma apps/api/prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy API source code
COPY apps/api apps/api/

# Generate Prisma client
RUN cd apps/api && pnpm db:generate

# Build the application
RUN cd apps/api && pnpm build

# Production stage
FROM node:18-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

# Copy built application
COPY --from=base /app/apps/api/dist apps/api/dist/
COPY --from=base /app/apps/api/package.json apps/api/
COPY --from=base /app/apps/api/prisma apps/api/prisma/
COPY --from=base /app/node_modules node_modules/
COPY --from=base /app/package.json .
COPY --from=base /app/pnpm-workspace.yaml .

# Generate Prisma client for production
RUN cd apps/api && pnpm db:generate

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
