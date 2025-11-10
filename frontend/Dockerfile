# Étape 1 : Build du site Vue
FROM node:20 AS build
WORKDIR /frontend
COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Étape 2 : Serveur Caddy
FROM caddy:latest
COPY --from=build /frontend/dist /var/www/html
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80