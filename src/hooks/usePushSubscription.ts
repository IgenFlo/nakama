"use client";

import { useState, useEffect, useCallback } from "react";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

export type PushState = {
  supported: boolean;
  permission: PermissionState;
  subscribed: boolean;
  loading: boolean;
  error: string | null;
  toggle: () => Promise<void>;
};

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    view[i] = rawData.charCodeAt(i);
  }
  return buffer;
}

// Timeout sur navigator.serviceWorker.ready (peut bloquer indéfiniment si le SW ne s'active pas)
function swReady(timeoutMs = 8000): Promise<ServiceWorkerRegistration> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Service worker timeout — relance l'app et réessaie")), timeoutMs),
    ),
  ]);
}

export function usePushSubscription(): PushState {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<PermissionState>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setSupported(false);
      setLoading(false);
      return;
    }

    setSupported(true);
    setPermission(Notification.permission as PermissionState);

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        setSubscribed(!!sub);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const subscribe = useCallback(async () => {
    const reg = await swReady();

    const perm = await Notification.requestPermission();
    setPermission(perm as PermissionState);
    if (perm !== "granted") return;

    const res = await fetch("/api/push/vapid-key");
    if (!res.ok) throw new Error(`Impossible de récupérer la clé VAPID (${res.status})`);
    const { publicKey } = (await res.json()) as { publicKey: string | null };
    if (!publicKey) throw new Error("Clé VAPID manquante — vérifie les variables d'environnement Vercel");

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const json = sub.toJSON();
    const saveRes = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
      }),
    });
    if (!saveRes.ok) throw new Error(`Erreur sauvegarde subscription (${saveRes.status})`);

    setSubscribed(true);
  }, []);

  const unsubscribe = useCallback(async () => {
    const reg = await swReady();
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;

    await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });

    await sub.unsubscribe();
    setSubscribed(false);
  }, []);

  const toggle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (subscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [subscribed, subscribe, unsubscribe]);

  return { supported, permission, subscribed, loading, error, toggle };
}
