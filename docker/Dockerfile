FROM node:10.10.0-alpine
ENV LANG="C.UTF-8"
WORKDIR /root

COPY run.sh run
RUN chmod +x /root/run && yarn global add dmhy-subscribe

CMD /root/run
