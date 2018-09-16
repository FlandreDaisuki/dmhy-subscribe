#!/bin/sh
echo 'Start running dmhy services...'
cp /root/dmhy-cron /var/spool/cron/crontabs/root
crond -l 2 -f
