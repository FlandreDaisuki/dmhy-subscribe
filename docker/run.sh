#!/bin/sh

echo 'Start running dmhy services...'
echo "$CRON_FREQ `which dmhy` >> /root/cron.log 2>&1" > /var/spool/cron/crontabs/root
crond -l 2 -f
