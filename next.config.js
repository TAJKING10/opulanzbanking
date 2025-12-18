const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export for production builds, not dev server
  ...(process.env.NODE_ENV === 'production' && {
    //output: 'export',
    basePath: '/opulanzbanking',
    assetPrefix: '/opulanzbanking/',
  }),
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
};

module.exports = withNextIntl(nextConfig);
