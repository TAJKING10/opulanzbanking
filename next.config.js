const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export enabled for GitHub Pages deployment
  // Note: Dynamic pages (booking/confirmation) with useSearchParams() will be skipped
  // These pages require a server or client-side navigation and won't work on static GitHub Pages
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
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
