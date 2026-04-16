const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Serve modern formats and limit generated sizes
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  // Enable gzip/brotli compression
  compress: true,
  // Reduce unused polyfills
  reactStrictMode: true,
  // Remove X-Powered-By header
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'date-fns',
      'recharts',
      '@radix-ui/react-icons',
      'lodash',
      '@tanstack/react-query',
      'sonner',
    ],
    // Optimize CSS loading
    optimizeCss: false, // requires critters, leave off unless installed
  },
  // Reduce bundle size by moving large data to server-only
  modularizeImports: {
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
  },
  // Security + performance headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Exclude heavy server-only packages from client bundles
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

// Wrap with Sentry. The withSentryConfig wrapper itself is safe to
// apply unconditionally — when SENTRY_AUTH_TOKEN is not set, build-time
// source-map upload is silently skipped. Runtime Sentry only activates
// when SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN are set in the environment.
const baseExport = withBundleAnalyzer(withNextIntl(nextConfig));

let exported = baseExport;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { withSentryConfig } = require('@sentry/nextjs');
  exported = withSentryConfig(baseExport, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: !process.env.SENTRY_AUTH_TOKEN,
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
  });
} catch {
  // @sentry/nextjs not installed — skip wrapper.
}

module.exports = exported;
