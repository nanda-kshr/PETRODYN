/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  webpack: (config) => {
    config.module.rules.push({
      test: /\.html$/i,
      type: 'asset/source',
    });
    return config;
  },
};

module.exports = nextConfig;

