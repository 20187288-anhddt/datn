FROM node:18.19-alpine

WORKDIR /usr/client

ARG PORT=3000

ENV PORT ${PORT}

ENV NODE_ENV=production

EXPOSE ${PORT}

ENV NODE_ENV=production

COPY package.json .

RUN npm install

COPY . .

CMD ["npm","start"]