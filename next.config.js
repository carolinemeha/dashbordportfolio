/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
 
  compiler: {
    styledComponents: true,
  },
  experimental: {
    appDir: true,
  }
};

module.exports = nextConfig;