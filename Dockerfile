FROM node:22-alpine

WORKDIR /app

COPY package*.json yarn.lock ./
RUN yarn install --pure-lockfile

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]