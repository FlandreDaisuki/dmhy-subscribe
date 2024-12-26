#!/usr/bin/env bash

set -e

LANG=${LANG:-C.UTF-8}
CRON_FREQ=${CRON_FREQ:-0 * * * *}
ARIA2_SECRET=${ARIA2_SECRET:-dockerdmhy}
ARIA2_HOST=${ARIA2_HOST:-aria2}
ARIA2_PORT=${ARIA2_PORT:-6800}

set -x

mkdir -p      data/aria2
mkdir -p      data/download
touch         data/cron.log
touch         data/dmhy.sqlite3
cp aria2.conf data/aria2/aria2.conf

cat << EOF > .env
PUID=$(id -u)
PGID=$(id -g)
LANG=${LANG}
CRON_FREQ=${CRON_FREQ}
ARIA2_SECRET=${ARIA2_SECRET}
ARIA2_HOST=${ARIA2_HOST}
ARIA2_PORT=${ARIA2_PORT}
EOF

sed -i s/rpc-secret=.*/"rpc-secret=${ARIA2_SECRET}"/g data/aria2/aria2.conf
sed -i s/rpc-listen-port=.*/"rpc-listen-port=${ARIA2_PORT}"/g data/aria2/aria2.conf

set +x

echo
echo "Setup completed. Please make sure that you have a 'dmhy-subscribe' docker image."
echo "If not, you can"
echo " - run \`docker pull docker pull ghcr.io/flandredaisuki/dmhy-subscribe\` to download it."
echo " - or build it yourself with command: \`docker build . -f docker/Dockerfile -t dmhy-subscribe\`."
# docker build . -f docker/Dockerfile -t dmhy-subscribe
