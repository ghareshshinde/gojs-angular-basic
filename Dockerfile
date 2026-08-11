# ---- build stage ----
# Node 18 + the legacy OpenSSL provider is the proven combo for this Angular 9 toolchain.
FROM node:18 AS build
WORKDIR /app
ENV NODE_OPTIONS=--openssl-legacy-provider
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npx ng build --prod

# ---- serve stage ----
FROM nginx:alpine
COPY --from=build /app/dist/angular-tutorial /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
