import type { NextConfig } from "next";

const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    "*.space-z.ai",
    "*.z.ai",
    "localhost",
    "127.0.0.1",
  ],
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
