import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Enable app router
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
