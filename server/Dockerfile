FROM node:18.19-alpine

WORKDIR /usr/server

ARG PORT=3333

ENV PORT ${PORT}

# ENV NODE_ENV=development

ENV NODE_SERVICE=server 

EXPOSE ${PORT}

COPY package.json .

RUN npm --force install

COPY . .

CMD ["npm","start"]