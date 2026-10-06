FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run db:generate && npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm","start"]
