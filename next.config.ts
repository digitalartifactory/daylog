import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'unsplash.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    // For limitations with Image component from Next.js
    // https://nextjs.org/docs/app/api-reference/components/image#reference
    // cannot use optimized images with urls that requires authentication from headers...
    // however api/v1/images and api/v1/storage are optimized with Sharp https://github.com/lovell/sharp
    unoptimized: true,
  },
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '64mb',
    },
  },
};

export default nextConfig;
