FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache curl openssl
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl -f http://localhost:3000/health || exit 1
CMD ["node", "server.js"]
