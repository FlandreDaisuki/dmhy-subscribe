FROM node:10.10.0-alpine
ENV LANG="C.UTF-8"
WORKDIR /root

COPY run.sh dmhy.sh ./
RUN chmod +x /root/run.sh /root/dmhy.sh && yarn global add dmhy-subscribe

CMD /root/run.sh
