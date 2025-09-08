import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ESLint configuration for builds
  eslint: {
    // Allow production builds to complete with ESLint warnings
    // This ensures deployment isn't blocked by non-critical linting issues
    ignoreDuringBuilds: true,
  },
  
  // Silence dev cross-origin warning when opening via LAN IP
  experimental: {
    // @ts-expect-error: allowedDevOrigins may not be typed in this Next version yet
    allowedDevOrigins: ['192.168.0.0/16', 'localhost'],
  },
  
  // Performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization settings
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: false,
    unoptimized: false,
  },
  
  // Optimize for performance
  productionBrowserSourceMaps: false,
}

export default nextConfig
