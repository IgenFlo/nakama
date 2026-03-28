"use client";

import { useState, useEffect, useCallback } from "react";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

export type PushState = {
  supported: boolean;
  permission: PermissionState;
  subscribed: boolean;
  loading: boolean;
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

export function usePushSubscription(): PushState {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<PermissionState>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Vérifier l'état initial au montage
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

    // Vérifier si une subscription existe déjà
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        setSubscribed(!!sub);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const subscribe = useCallback(async () => {
    const reg = await navigator.serviceWorker.ready;

    // Demander la permission si pas encore accordée
    const perm = await Notification.requestPermission();
    setPermission(perm as PermissionState);
    if (perm !== "granted") return;

    // Récupérer la clé VAPID publique
    const res = await fetch("/api/push/vapid-key");
    const { publicKey } = (await res.json()) as { publicKey: string };

    // Créer la subscription
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const json = sub.toJSON();
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
      }),
    });

    setSubscribed(true);
  }, []);

  const unsubscribe = useCallback(async () => {
    const reg = await navigator.serviceWorker.ready;
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
    try {
      if (subscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } finally {
      setLoading(false);
    }
  }, [subscribed, subscribe, unsubscribe]);

  return { supported, permission, subscribed, loading, toggle };
}
