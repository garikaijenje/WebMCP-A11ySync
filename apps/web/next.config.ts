import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@a11ysync/core", "@a11ysync/react"],
  reactStrictMode: true
};

export default nextConfig;
