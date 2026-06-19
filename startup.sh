#!/bin/bash
export NODE_ENV=production
export PORT=${PORT:-8080}
cd /home/site/wwwroot
echo "Installing dependencies..."
npm install --omit=dev
echo "Starting Next.js..."
exec npm start
