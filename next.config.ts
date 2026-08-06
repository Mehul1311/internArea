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
  serverExternalPackages: ['pg', 'sqlite3', 'bcrypt'],
  outputFileTracingIncludes: {
    '/api/**/*': ['./backend/internshala.sqlite'],
  },
};

export default nextConfig;
