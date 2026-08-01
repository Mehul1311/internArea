import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
};

export default nextConfig;
