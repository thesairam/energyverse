# Energyverse API (Node.js)
FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts

COPY *.js ./

EXPOSE 8789
ENV PORT=8789 NODE_ENV=production
CMD ["node", "index.js"]
