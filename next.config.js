/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@xrpl-wallet-standard/core',
    '@xrpl-wallet-adapter/walletconnect',
  ],
};

module.exports = nextConfig;
