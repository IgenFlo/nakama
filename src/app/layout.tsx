import type { Metadata, Viewport } from "next";
import { SWRegistrar } from "@/components/layout/SWRegistrar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nakama",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/logo-carre.png",
    apple: "/logo-carre.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nakama",
  },
};

export const viewport: Viewport = {
  themeColor: "#4c1036",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col">
        <SWRegistrar>{children}</SWRegistrar>
      </body>
    </html>
  );
}
