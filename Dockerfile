FROM node:18-alpine

# Instalar OpenSSL 3 e dependências de build
RUN apk add --no-cache \
    openssl3 \
    build-base

WORKDIR /usr/app

# Copia apenas os arquivos essenciais primeiro
COPY package.json package-lock.json* ./ 
COPY prisma ./prisma

# Instala as dependências
RUN npm install --legacy-peer-deps

# Agora copia o resto do projeto
COPY . .

EXPOSE 5000

CMD [ "npm", "run", "dev" ]