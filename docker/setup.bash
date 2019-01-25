#!/bin/bash

export LANG='C.UTF-8'
export CRON_FREQ='0 * * * *'

set -ex

mkdir -p data/dmhy data/cron data/aria2 data/download
touch data/cron/cron.log
cp config_examples/conf.example.json data/dmhy/config.json
cp config_examples/aria2.conf        data/aria2/aria2.conf

sed -i s/PUID=.*/PUID=$(id -u)/g docker-compose.yml
sed -i s/PGID=.*/PGID=$(id -g)/g docker-compose.yml
sed -i s/LANG=.*/"LANG=${LANG}"/g docker-compose.yml
sed -i s/CRON_FREQ=.*/"CRON_FREQ=${CRON_FREQ}"/g docker-compose.yml

set +x

echo
echo "Setup completed. Please make sure that you have a 'dmhy-subscribe' docker image."
echo "If not, you can"
echo " - run \`docker pull wabilin/dmhy-subscribe && docker tag wabilin/dmhy-subscribe dmhy-subscribe\` to download it."
echo " - or build it yourself with command: \`docker build . -t dmhy-subscribe\`."
# docker build . -t dmhy-subscribe
