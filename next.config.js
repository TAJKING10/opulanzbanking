const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: Static export (output: 'export') is disabled because we have dynamic pages
  // that use useSearchParams() and need server-side rendering or client-side routing
  // If you need static export, consider removing booking/confirmation pages or
  // implementing them with different patterns
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
