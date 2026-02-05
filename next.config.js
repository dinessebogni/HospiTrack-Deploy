/** @type {import('next').NextConfig} */
require('dotenv').config({ quiet: true });

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000', 
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
