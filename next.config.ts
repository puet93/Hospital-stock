import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["postgres"],
  /** Raíz del app en CI (evita warning de lockfile fuera del repo; no usar __dirname en ESM). */
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
