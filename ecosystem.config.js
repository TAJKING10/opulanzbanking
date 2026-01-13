/**
 * PM2 Ecosystem Configuration for Azure App Service
 *
 * This configuration ensures Next.js runs properly on Azure App Service
 * with the correct port configuration and process management.
 */

module.exports = {
  apps: [
    {
      name: 'opulanz-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 8080,
      },
    },
  ],
};
