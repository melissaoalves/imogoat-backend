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

# Gera o cliente Prisma para o ambiente do contêiner
RUN npx prisma generate

# Agora copia o resto do projeto
COPY . .

EXPOSE 5000

CMD [ "npm", "run", "dev" ]