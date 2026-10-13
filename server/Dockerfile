FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV PORT=2567 DATA_DIR=/data
EXPOSE 2567
CMD ["node","src/index.js"]
