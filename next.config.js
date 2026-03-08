/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@xrpl-wallet-standard/core',
    '@xrpl-wallet-adapter/walletconnect',
  ],
  experimental: {
    // Next.js 15+ defaults dynamic pages to 0s in the Router Cache,
    // meaning prefetched data is discarded immediately. Setting these
    // values lets hover-prefetched pages load instantly from cache.
    // React Query still refetches on mount for fresh data.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

module.exports = nextConfig;
