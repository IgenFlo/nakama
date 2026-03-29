"use client";

import { SerwistProvider } from "@serwist/next/react";

export function SWRegistrar({ children }: { children: React.ReactNode }) {
  return <SerwistProvider swUrl="/sw.js">{children}</SerwistProvider>;
}
