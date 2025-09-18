
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
  
  // Optimize for serverless environments and stability
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/hr-client',
    '@prisma/payroll-client'
  ],
  outputFileTracingIncludes: {
    '/api/**/*': ['./prisma/**/*'],
  },
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Additional optimizations for serverless stability
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      })
    }
    return config
  },
  
  // Headers for better API performance and monitoring
  async headers() {
    return [
      {
        source: '/api/payslips',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'X-API-Version',
            value: '2.0.0',
          },
          {
            key: 'X-Stability-Enhanced',
            value: 'true',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Powered-by',
            value: 'SalarySync-Stable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

