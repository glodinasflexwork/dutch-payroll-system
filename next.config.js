/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  experimental: {
    // Enable server components
    serverComponentsExternalPackages: ['@prisma/client', '@prisma/hr-client', '@prisma/payroll-client'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Copy Prisma engines for all clients
      config.externals.push({
        '@prisma/client': '@prisma/client',
        '@prisma/hr-client': '@prisma/hr-client', 
        '@prisma/payroll-client': '@prisma/payroll-client'
      })
    }
    return config
  },
}

module.exports = nextConfig

