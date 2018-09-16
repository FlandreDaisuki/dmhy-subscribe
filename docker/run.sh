#!/bin/sh

export LANG='C.UTF-8'
export CRON_FREQ='0 * * * *'

echo 'Start running dmhy services...'
echo "$CRON_FREQ `which dmhy` >> /root/cron.log 2>&1" > /var/spool/cron/crontabs/root
crond -l 2 -f
