# Usar imagem oficial do Node.js LTS (Alpine para imagem menor)
FROM node:18-alpine

# Configurar timezone para America/Sao_Paulo
# Alpine usa tzdata do pacote apk
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    echo "America/Sao_Paulo" > /etc/timezone && \
    apk del tzdata

# Definir variável de ambiente para timezone
ENV TZ=America/Sao_Paulo

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Criar diretório de logs
RUN mkdir -p logs

# Expor porta (caso queira adicionar API de status no futuro)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "index.js"]
