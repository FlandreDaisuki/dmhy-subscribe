#!/bin/sh

dmhy config downloader aria2
dmhy config aria2-jsonrpc "http://token:${ARIA2_SECRET}@${ARIA2_HOST}:${ARIA2_PORT}/jsonrpc"

echo 'Start running dmhy services...'
echo "${CRON_FREQ} $(which dmhy) pull --then-download 2>&1 | tee -a /root/app/cron.log" > /var/spool/cron/crontabs/root
crond -l 2 -f
