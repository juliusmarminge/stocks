/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    images: {
      allowFutureImage: true,
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**.com",
        },
      ],
    },
  },
};

module.exports = nextConfig;
