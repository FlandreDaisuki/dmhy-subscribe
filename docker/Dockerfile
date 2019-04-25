FROM node:10-alpine

WORKDIR /root

COPY run.sh ./

RUN apk add --no-cache tzdata

RUN chmod +x /root/run.sh && yarn global add dmhy-subscribe

CMD /root/run.sh
