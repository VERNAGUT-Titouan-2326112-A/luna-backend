FROM node:22-alpine

WORKDIR /app

COPY src/backend/package*.json ./

RUN npm install --omit=dev

COPY src/backend/ ./

EXPOSE 3000

CMD ["node", "server.js"]