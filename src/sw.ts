/// <reference lib="webworker" />
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
});

serwist.addEventListeners();

self.addEventListener("push", (event) => {
  const data = event.data?.json() as { title: string; body: string; url?: string } | undefined;
  if (!data) return;

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      tag: "nakama-alert",
      vibrate: [200, 100, 200],
      data: { url: data.url ?? "/dashboard" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url: string = (event.notification.data as { url: string }).url;
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      const existingClient = clientList.find((c) => c.url === url && "focus" in c);
      if (existingClient) return (existingClient as WindowClient).focus();
      return self.clients.openWindow(url);
    }),
  );
});
