import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um build "standalone" (server + deps mínimas) para imagens Docker enxutas.
  output: "standalone",
  // better-sqlite3 é um módulo nativo: não deve ser empacotado pelo bundler.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
