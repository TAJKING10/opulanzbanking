#!/bin/bash
# Azure App Service startup script for Next.js

echo "Starting Opulanz Frontend on Azure App Service..."

export NODE_ENV=production
export PORT=${PORT:-8080}

cd /home/site/wwwroot

# If a pre-built app is deployed, skip install+build and start immediately.
# This prevents the 3-5 min downtime on every deployment.
if [ -f ".next/BUILD_ID" ]; then
  echo "Pre-built app detected. Installing production deps only..."
  npm ci --omit=dev --prefer-offline 2>&1 || npm install --omit=dev 2>&1
  echo "Starting server..."
  exec npm start
else
  echo "No build found. Installing all deps and building..."
  npm ci 2>&1
  npm run build 2>&1
  echo "Starting server..."
  exec npm start
fi
