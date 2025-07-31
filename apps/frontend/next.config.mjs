/** @type {import('next').NextConfig} */
const nextConfig = {
  // Base config inlined to avoid dependency issues on Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Frontend-specific configuration can be added here
}

export default nextConfig