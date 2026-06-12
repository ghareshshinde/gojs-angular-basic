# ---- Build stage ----
# Angular 9 + its webpack toolchain build cleanly on Node 14, avoiding the
# OpenSSL "digital envelope routines::unsupported" error seen on newer Node.
FROM node:14-alpine AS build

WORKDIR /app

# Install dependencies first so this layer is cached unless lockfiles change.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and produce a production build.
COPY . .
RUN npm run build -- --prod --output-path=dist/app

# ---- Runtime stage ----
# Serve the static bundle with a tiny nginx image.
FROM nginx:1.27-alpine AS runtime

# SPA routing config (falls back to index.html).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Built assets from the previous stage.
COPY --from=build /app/dist/app /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
