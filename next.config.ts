import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um build "standalone" (server + deps mínimas) para imagens Docker enxutas.
  output: "standalone",
};

export default nextConfig;
