/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "164.52.215.173",
        port: "4000",
      },
      {
        protocol: "http",
        hostname: "164.52.215.173",
        port: "4001",
      },
    ],
  },
};
export default nextConfig;
