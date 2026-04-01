/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },

  // Tell Next.js to optimize these heavy packages
  // Only loads the parts actually used — not entire library
  experimental: {
    optimizePackageImports: [
      'recharts',
      'react-leaflet',
      'react-leaflet-cluster',
      '@lottiefiles/react-lottie-player',
      'lucide-react',
    ]
  },

  // Cloudinary images allowed
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Webpack config — prevent server-side rendering of
  // browser-only libraries (leaflet, lottie)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // These libraries use browser APIs — never run on server
      config.externals = [
        ...(config.externals || []),
        'leaflet',
        'react-leaflet',
        'react-leaflet-cluster',
      ]
    }
    return config
  },
}

import withPWAInit from 'next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: '/offline',
  }
})

export default withPWA(nextConfig)
