/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: config => {
    config.resolve.fallback = { fs: false }; // eslint-disable-line no-param-reassign
    return config;
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
