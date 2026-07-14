#!/bin/bash
REMOTE_USER="bclark"
REMOTE_IP="165.128.1.17"
REMOTE_PATH="/home/bclark/api-final-project2"

# NOTE: we need to exclude the log files from being copied because they will replace the ones on the live server
scp -r src $REMOTE_USER@$REMOTE_IP:$REMOTE_PATH
scp .env $REMOTE_USER@$REMOTE_IP:$REMOTE_PATH
scp package.json $REMOTE_USER@$REMOTE_IP:$REMOTE_PATH