import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera pasta .next/standalone — necessário para deploy no VPS Hostinger
  output: "standalone",
};

export default nextConfig;
