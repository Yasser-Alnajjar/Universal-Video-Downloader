/** @type {import('next').NextConfig} */
import nextIntl from "next-intl/plugin";

import { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  output: "standalone",
  transpilePackages: ["three"],
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development",
  },
  images: {
    minimumCacheTTL: 300,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

const withNextIntl = nextIntl("./src/i18n.ts");
export default withNextIntl(nextConfig);
