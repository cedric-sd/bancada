import type { NextConfig } from "next";
import { readFileSync } from "node:fs";

// Versão do app lida do package.json em build-time e exposta como env inline.
const { version } = JSON.parse(readFileSync("./package.json", "utf8")) as { version: string };

const nextConfig: NextConfig = {
  // Gera um build "standalone" (server + deps mínimas) para imagens Docker enxutas.
  output: "standalone",
  // Módulos nativos: não devem ser empacotados pelo bundler.
  serverExternalPackages: ["better-sqlite3", "sharp"],
  // Disponível como process.env.APP_VERSION no app (inlined no build).
  env: { APP_VERSION: version },
};

export default nextConfig;
