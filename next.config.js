/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@xrpl-wallet-standard/core',
    '@xrpl-wallet-adapter/walletconnect',
  ],
  experimental: {
    // Client-side Router Cache TTL. Visited pages are cached for these
    // durations - repeat navigations are instant (no server roundtrip).
    // React Query still refetches on mount for fresh data.
    staleTimes: {
      dynamic: 180,
      static: 300,
    },
  },
};

module.exports = nextConfig;
