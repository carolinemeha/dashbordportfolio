/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  /**
   * Windows + HMR : cache Webpack parfois désynchronisé → chunks *.js orphelins.
   * On désactive seulement le cache persistant en dev (splitChunks: false cassait
   * la résolution de `/_error` → page « missing required error components » et 404 sur /_next/static).
   * En cas de chunks incohérents : `npm run dev:fresh`.
   */
  webpack: (config, { dev }) => {
    if (dev && process.platform === 'win32') {
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
