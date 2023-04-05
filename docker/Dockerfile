FROM node:18-alpine

WORKDIR /root/app

COPY package.json .

# hadolint ignore=DL3018
RUN apk add --no-cache tzdata \
 && npm i --omit dev

COPY src ./src
COPY docker ./docker

RUN npm i -g . \
 && chmod +x /root/app/docker/run.sh

CMD [ "/root/app/docker/run.sh" ]
