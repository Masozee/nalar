import os from 'os';
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3-csis-web.s3.ap-southeast-1.amazonaws.com',
        pathname: '/**',
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion', 'lucide-react', 'react-icons'],
    // Enable faster builds
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    // Enable faster compilation
    cpus: Math.max(1, os.cpus().length - 1),
  },
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  poweredByHeader: false,
  // Optimize compilation
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Cache configuration for faster rebuilds
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Webpack optimizations for faster builds
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Speed up development builds
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          cacheGroups: {
            default: false,
            vendors: false,
            // Separate vendor bundle for faster rebuilds
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20
            },
            // Separate common bundle
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true
            }
          }
        }
      };
      
      // Enable persistent caching for faster rebuilds
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename]
        }
      };
    }
    
    // Optimize module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), 'src')
    };
    
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }
    
    return config;
  },
  // Enable faster refresh
  reactStrictMode: true,
  // Optimize static generation
  output: 'standalone',
};

export default nextConfig; 