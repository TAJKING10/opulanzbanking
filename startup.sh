#!/bin/bash
export NODE_ENV=production
export PORT=${PORT:-8080}
export HOSTNAME=0.0.0.0
cd /home/site/wwwroot
echo "Starting Opulanz on port $PORT..."
exec node .next/standalone/server.js
