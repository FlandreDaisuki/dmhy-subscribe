#!/bin/bash

set -x

mkdir -p data
mkdir -p data/dmhy
mkdir -p data/cron
mkdir -p data/aria2
touch data/cron/cron.log
cp config_examples/conf.example.json data/dmhy/config.json
cp config_examples/cron.example      data/cron/dmhy-cron
cp config_examples/aria2.conf        data/aria2/aria2.conf
# docker build . -t dmhy-subscribe
