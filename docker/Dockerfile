FROM node:10.10.0-alpine

WORKDIR /root

COPY run.sh ./

RUN chmod +x /root/run.sh && yarn global add dmhy-subscribe

CMD /root/run.sh
