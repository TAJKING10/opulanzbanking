const withNextIntl = require('next-intl/plugin')(
  './i18n/request.ts'
);

// Content-Security-Policy that covers all third-party integrations
// (Google OAuth, Sumsub KYC, Tawk.to chat, PayPal, Google Fonts)
const CSP = [
  "default-src 'self'",
  // Scripts: Next.js needs 'unsafe-inline' for hydration; Sumsub / Tawk.to / Google
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://embed.tawk.to https://va.tawk.to https://cdn.jsdelivr.net https://static.hsappstatic.net https://js.stripe.com https://www.paypal.com https://www.paypalobjects.com",
  // Styles: self + Google Fonts inline styles
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonts: Google Fonts CDN
  "font-src 'self' https://fonts.gstatic.com data:",
  // Images: self + common CDNs + data URIs
  "img-src 'self' data: blob: https:",
  // Connections: backend API + OAuth + KYC + chat
  "connect-src 'self' https://*.opulanz.com https://*.azurewebsites.net https://accounts.google.com https://oauth2.googleapis.com https://api.sumsub.com https://*.tawk.to wss://*.tawk.to https://www.paypal.com",
  // Frames: Sumsub KYC widget + PayPal checkout
  "frame-src 'self' https://api.sumsub.com https://*.sumsub.com https://www.paypal.com https://accounts.google.com",
  // Media
  "media-src 'self' blob:",
  // Workers for Next.js
  "worker-src 'self' blob:",
  // Block object/embed plugins
  "object-src 'none'",
  // Upgrade insecure requests on production
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  // Prevent clickjacking — pages must not be embedded in foreign frames
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Block MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Only send origin in Referer header (hides path/query)
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable unused browser features
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // Enforce HTTPS for 1 year (only active when served over HTTPS)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // CSP
  { key: 'Content-Security-Policy', value: CSP },
];

const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
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
    // Tree-shake heavy packages at compile time
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'date-fns'],
  },
  // Attach security headers to every response
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  // Environment variables for production URL (used for SEO)
  env: {
    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  },
};

module.exports = withNextIntl(nextConfig);
