/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.sanity.io"],
  },
  typescript: {
    // Set this to true to ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Set this to true to ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig

