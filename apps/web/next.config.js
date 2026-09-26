/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // If a dedicated API backend is configured via environment variable, proxy backend routes to it
    if (process.env.NEXT_PUBLIC_API_URL) {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
        },
      ];
    }

    // In local development, proxy legacy Express routes to localhost:3000 (excluding native Next.js routes)
    if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
      return [
        {
          source: '/api/journal/:path*',
          destination: 'http://localhost:3000/api/journal/:path*',
        },
        {
          source: '/api/invoices/:path*',
          destination: 'http://localhost:3000/api/invoices/:path*',
        },
        {
          source: '/api/bills/:path*',
          destination: 'http://localhost:3000/api/bills/:path*',
        },
        {
          source: '/api/items/:path*',
          destination: 'http://localhost:3000/api/items/:path*',
        },
        {
          source: '/api/tax/:path*',
          destination: 'http://localhost:3000/api/tax/:path*',
        },
        {
          source: '/api/reports/:path*',
          destination: 'http://localhost:3000/api/reports/:path*',
        },
        {
          source: '/api/reconciliation/:path*',
          destination: 'http://localhost:3000/api/reconciliation/:path*',
        },
        {
          source: '/api/admin/:path*',
          destination: 'http://localhost:3000/api/admin/:path*',
        },
      ];
    }

    return [];
  },
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-charts',
      '@mui/x-data-grid',
      '@mui/x-date-pickers',
    ],
  },
};

module.exports = nextConfig;
