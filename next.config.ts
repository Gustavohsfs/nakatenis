import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deploy em VPS Node (PM2 + Nginx) — ver deploy/README.md
  output: "standalone",
  poweredByHeader: false,
  images: {
    // Loader próprio: a transformação vira parâmetro na URL do Cloudinary e
    // quem redimensiona é o CDN deles. Sem isto, /_next/image faria o resize
    // no nosso servidor — o que mais consome CPU num plano compartilhado.
    loader: "custom",
    loaderFile: "./src/lib/images/loader.ts",
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    qualities: [60, 75, 90],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
