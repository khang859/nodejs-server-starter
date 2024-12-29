FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install --frozen-lockfile --production
COPY . .
EXPOSE 3000
CMD ["node", "src/index.ts"]
