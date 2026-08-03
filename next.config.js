const withNextIntl = require('next-intl/plugin')(
  './i18n/request.ts'
);

// Content-Security-Policy that covers all third-party integrations
// (Google OAuth, Sumsub KYC, Tawk.to chat, PayPal, Google Fonts)
const CSP = [
  "default-src 'self'",
  // Scripts: Next.js needs 'unsafe-inline' for hydration; Sumsub / Tawk.to / Google
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://embed.tawk.to https://va.tawk.to https://cdn.jsdelivr.net https://static.hsappstatic.net https://js.stripe.com https://www.paypal.com https://www.sandbox.paypal.com https://www.paypalobjects.com https://assets.calendly.com",
  // Styles: self + Google Fonts inline styles
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonts: Google Fonts CDN
  "font-src 'self' https://fonts.gstatic.com data:",
  // Images: self + common CDNs + data URIs
  "img-src 'self' data: blob: https:",
  // Connections: backend API + OAuth + KYC + chat
  "connect-src 'self' http://localhost:5000 https://*.opulanz.com https://*.azurewebsites.net https://accounts.google.com https://oauth2.googleapis.com https://api.sumsub.com https://*.tawk.to wss://*.tawk.to https://www.paypal.com https://www.sandbox.paypal.com https://api-m.sandbox.paypal.com https://api-m.paypal.com https://calendly.com https://*.calendly.com",
  // Frames: Sumsub KYC widget + PayPal checkout
  "frame-src 'self' https://api.sumsub.com https://*.sumsub.com https://www.paypal.com https://www.sandbox.paypal.com https://*.paypal.com https://accounts.google.com https://calendly.com https://*.calendly.com",
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

const isMobileBuild = process.env.NEXT_OUTPUT === 'export';
const isStandaloneBuild = process.env.NEXT_OUTPUT === 'standalone';

const nextConfig = {
  // 'export' for Capacitor mobile, 'standalone' when explicitly requested, undefined for next start
  output: isMobileBuild ? 'export' : isStandaloneBuild ? 'standalone' : undefined,
  // Required for Capacitor: static files need trailing slashes for proper routing
  trailingSlash: isMobileBuild ? true : false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    // When NEXT_PUBLIC_CDN_URL is set (e.g. Azure CDN / Cloudflare URL),
    // Next.js will rewrite image src attributes to load from that origin,
    // reducing load on the App Service and improving global latency.
    // To activate: set NEXT_PUBLIC_CDN_URL=https://cdn.opulanz.com in Azure env vars.
    ...(process.env.NEXT_PUBLIC_CDN_URL
      ? { loader: 'custom', loaderFile: './lib/cdn-image-loader.js' }
      : { unoptimized: true }),
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    // Compile-time tree-shaking for large icon/utility packages —
    // prevents each icon from becoming its own tiny chunk.
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-accordion',
      'date-fns',
      'next-intl',
    ],
  },
  // Merge small webpack chunks to reduce RTT on initial load.
  // Chunks smaller than 20 KB are folded into their parent to cut the
  // 14+ separate script requests flagged by the audit.
  webpack(config, { isServer }) {
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        minSize: 20_000,        // don't create chunks smaller than 20 KB
        maxInitialRequests: 6,  // at most 6 parallel requests per entry point
        maxAsyncRequests: 8,
        cacheGroups: {
          // Vendor bundle: react, react-dom, next internals
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|next|scheduler)[\\/]/,
            priority: 40,
            chunks: 'all',
          },
          // UI library bundle: radix-ui + shadcn primitives
          ui: {
            name: 'ui',
            test: /[\\/]node_modules[\\/](@radix-ui|cmdk|class-variance-authority|clsx|tailwind-merge)[\\/]/,
            priority: 30,
            chunks: 'all',
          },
          // Everything else from node_modules
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: 20,
            chunks: 'all',
          },
        },
      };
    }
    return config;
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
