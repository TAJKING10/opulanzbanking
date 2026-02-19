const withNextIntl = require('next-intl/plugin')(
  // Specify the path to the new i18n config
  './i18n/request.ts'
);

const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Environment variables for production URL (used for SEO)
  env: {
    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  },
};

module.exports = withNextIntl(nextConfig);
