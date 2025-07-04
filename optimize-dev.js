#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Optimizing Next.js development environment...');

// Clear Next.js cache
const nextCacheDir = path.join(__dirname, '.next');
if (fs.existsSync(nextCacheDir)) {
  console.log('🧹 Clearing Next.js cache...');
  try {
    execSync(`rm -rf ${nextCacheDir}`, { stdio: 'inherit' });
    console.log('✅ Next.js cache cleared');
  } catch (error) {
    console.log('⚠️  Could not clear Next.js cache:', error.message);
  }
}

// Clear TypeScript build cache
const tsBuildInfo = path.join(__dirname, '.next/tsconfig.tsbuildinfo');
if (fs.existsSync(tsBuildInfo)) {
  console.log('🧹 Clearing TypeScript build cache...');
  try {
    fs.unlinkSync(tsBuildInfo);
    console.log('✅ TypeScript build cache cleared');
  } catch (error) {
    console.log('⚠️  Could not clear TypeScript cache:', error.message);
  }
}

// Optimize node_modules (if needed)
console.log('📦 Checking node_modules optimization...');
const nodeModulesDir = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesDir)) {
  try {
    const stats = fs.statSync(nodeModulesDir);
    const sizeGB = (stats.size / (1024 * 1024 * 1024)).toFixed(2);
    console.log(`📊 node_modules size: ${sizeGB}GB`);
    
    if (sizeGB > 1) {
      console.log('💡 Consider running: npm prune && npm dedupe');
    }
  } catch (error) {
    console.log('⚠️  Could not check node_modules size');
  }
}

// Set memory optimization
console.log('🧠 Setting memory optimization...');
process.env.NODE_OPTIONS = '--max-old-space-size=8192';

console.log('✨ Development environment optimized!');
console.log('🏃 Run: npm run dev for optimized development server');
console.log('🏃 Run: npm run dev:fast for maximum performance mode'); 