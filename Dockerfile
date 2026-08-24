# Multi-stage Dockerfile para Aplicação PLD/FT
# 1. Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifests de dependência
COPY package*.json ./

# Instalação limpa de dependências
RUN npm ci

# Copiar todo o código-fonte
COPY . .

# Compilar build de produção (Vite React SPA)
RUN npm run build

# 2. Production runtime stage com Nginx Alpine leve
FROM nginx:alpine

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar artefatos compilados do builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expor porta padrão de execução
EXPOSE 80

# Comando de inicialização do Nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]
