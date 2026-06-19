#!/bin/bash
# Azure App Service startup script for Next.js

echo "🚀 Starting Opulanz Frontend on Azure App Service..."

# Set Node.js environment
export NODE_ENV=production

# Use Azure's dynamic port or default to 8080
export PORT=${PORT:-8080}

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building Next.js application..."
npm run build

echo "✅ Starting Next.js server on port $PORT..."
npm start
