import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel supplies its own build adapter; standalone output is for Docker.
  output: process.env.VERCEL === "1" ? undefined : "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
