import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  turbopack: {
    // Explicitly set workspace root to avoid picking up other lockfiles (e.g., at $HOME)
    root: __dirname,
  },
};

export default nextConfig;
