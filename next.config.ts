import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Silence dev cross-origin warning when opening via LAN IP
  experimental: {
    // @ts-expect-error: allowedDevOrigins may not be typed in this Next version yet
    allowedDevOrigins: ['192.168.0.0/16', 'localhost'],
  },
}

export default nextConfig
