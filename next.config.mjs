/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable PWA features that might be causing issues
  generateEtags: false,
  poweredByHeader: false,
}

export default nextConfig
