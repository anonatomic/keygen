#!/bin/sh

cd $(dirname "$0")/.. && pwd
export NODE_ENV=production

service_name="tg-wallet"
log_dir="/var/log/node-service"
info_log="$log_dir/$service_name.log"
error_log="$log_dir/$service_name-error.log"
forever_log="$log_dir/$service_name-forever.log"

forever stop $service_name

find /var/log/node-service -name "$service_name*.log" -type f -delete

forever start -c "node -r source-map-support/register --enable-source-maps" --uid "$service_name" -o $info_log -e $error_log -l $forever_log dist/server.bundle.js