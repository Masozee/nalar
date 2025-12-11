import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Enable standalone build for Docker
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint errors during build
  },
  env: {
    NEXT_PUBLIC_FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    NEXT_PUBLIC_API_URL: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/v1` : "http://localhost:8000/api/v1",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['hugeicons-react', '@tanstack/react-table', '@tanstack/react-query'],
    // Disable turbopack for production builds
    turbo: undefined,
  },
};

export default nextConfig;
