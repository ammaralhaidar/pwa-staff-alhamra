# Stage 1: Build static assets
FROM node:22-alpine AS builder
WORKDIR /app

ARG VITE_ODOO_DATABASE=db_alhamra_production
ENV VITE_ODOO_DATABASE=$VITE_ODOO_DATABASE

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
