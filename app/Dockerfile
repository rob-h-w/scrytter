FROM node:alpine

WORKDIR /usr/app

COPY ./package.json /usr/app
COPY ./yarn.lock /usr/app

RUN yarn

COPY . /usr/app

EXPOSE 8925