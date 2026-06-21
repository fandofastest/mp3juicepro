FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy workspace configuration files
COPY package.json package-lock.json* tsconfig.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/database/package.json ./packages/database/
COPY packages/auth/package.json ./packages/auth/
COPY packages/providers/package.json ./packages/providers/
COPY packages/ui/package.json ./packages/ui/
COPY apps/admin/package.json ./apps/admin/

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy the rest of the workspace source code
COPY packages/ ./packages/
COPY apps/admin/ ./apps/admin/

# Build packages first
RUN npm run build --workspace=packages/types
RUN npm run build --workspace=packages/utils
RUN npm run build --workspace=packages/database
RUN npm run build --workspace=packages/auth
RUN npm run build --workspace=packages/providers
RUN npm run build --workspace=packages/ui

# Build Next.js Admin App
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=apps/admin

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "run", "start", "--workspace=apps/admin"]
