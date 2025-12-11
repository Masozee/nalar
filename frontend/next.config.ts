import type { NextConfig } from "next";
import path from "path";
import dotenv from "dotenv";

// Load .env from project root (parent of frontend)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

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
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // Exclude pdfjs-dist from server-side rendering
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('pdfjs-dist');
    }

    return config;
  },
};

export default nextConfig;
