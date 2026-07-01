import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um build "standalone" (server + deps mínimas) para imagens Docker enxutas.
  output: "standalone",
  // Módulos nativos: não devem ser empacotados pelo bundler.
  serverExternalPackages: ["better-sqlite3", "sharp"],
};

export default nextConfig;
