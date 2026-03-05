# Energyverse API (Node.js)
FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts

COPY server/ ./server/

EXPOSE 8788
ENV PORT=8788 NODE_ENV=production
CMD ["node", "server/index.js"]
