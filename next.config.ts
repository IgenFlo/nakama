import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Autoriser les appareils sur le réseau local en dev (mobile, tablette, etc.)
  allowedDevOrigins: ["192.168.1.197"],
};

export default withSerwist({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
})(nextConfig);
