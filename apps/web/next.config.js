/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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

