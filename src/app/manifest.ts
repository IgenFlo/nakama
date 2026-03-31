import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nakama",
    short_name: "Nakama",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#fef5ef",
    theme_color: "#4c1036",
    orientation: "portrait",
    icons: [
      { src: "/logo-carre.png", sizes: "512x512", type: "image/png" },
      {
        src: "/logo-carre.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
