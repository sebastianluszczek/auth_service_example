FROM node:12-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -s

COPY . .

EXPOSE 5000

CMD npm run dev