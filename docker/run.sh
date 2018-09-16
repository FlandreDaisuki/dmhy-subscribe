#!/bin/sh
echo 'Start running dmhy services...'
crond -l 2 -f
