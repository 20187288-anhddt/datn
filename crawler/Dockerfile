FROM node:18.19-alpine

WORKDIR /usr/crawler

ENV NODE_ENV=development

ENV NODE_SERVICE=crawler 

COPY package.json .

RUN npm --force install

COPY . .

CMD ["npm","start"]