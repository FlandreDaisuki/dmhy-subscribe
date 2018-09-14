FROM node:10.10.0-alpine
ENV LANG="C.UTF-8"
WORKDIR /root

RUN yarn global add dmhy-subscribe

CMD echo 'start running dmhy services...' && crond && tail -f /root/cron.log

