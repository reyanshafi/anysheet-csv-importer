import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle so the Docker image doesn't need node_modules.
  output: "standalone",
};

export default nextConfig;
