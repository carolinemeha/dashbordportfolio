/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  /**
   * Windows + HMR : cache Webpack et chunks désynchronisés →
   * "Cannot find module './8378.js'" puis 404 sur main.js, react-refresh.js, _app.js (client).
   * - cache désactivé en dev
   * - splitChunks désactivé côté client ET serveur en dev (évite les chunks *.js orphelins)
   */
  webpack: (config, { dev }) => {
    if (dev && process.platform === 'win32') {
      config.cache = false;
      if (!config.optimization) config.optimization = {};
      config.optimization.splitChunks = false;
    }
    return config;
  },
};

module.exports = nextConfig;
