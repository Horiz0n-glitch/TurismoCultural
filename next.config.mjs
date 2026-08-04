/** @type {import('next').NextConfig} */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'turismocultural.com.ar',
        pathname: '/wp-content/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-0a6f47d90d604a258a39345ef8280f5d.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
