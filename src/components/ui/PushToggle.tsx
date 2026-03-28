"use client";

import { usePushSubscription } from "@/hooks/usePushSubscription";
import { Icon } from "@/components/ui/Icon";

export function PushToggle() {
  const { supported, permission, subscribed, loading, error, toggle } =
    usePushSubscription();

  if (!supported) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-lavender/60 flex items-center justify-center shrink-0">
          <Icon name="bellOff" size={16} className="text-text-muted" />
        </div>
        <p className="text-sm text-text-muted">
          Notifications non supportées sur cet appareil.
        </p>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
          <Icon name="bellOff" size={16} className="text-red-500" />
        </div>
        <p className="text-sm text-text-muted">
          Notifications bloquées — autorise-les dans les réglages du navigateur.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={[
              "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
              subscribed ? "bg-accent/10" : "bg-lavender/60",
            ].join(" ")}
          >
            <Icon
              name={subscribed ? "bell" : "bellOff"}
              size={16}
              className={subscribed ? "text-accent" : "text-text-muted"}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-text">Notifications push</p>
            <p className="text-xs text-text-muted mt-0.5">
              {subscribed ? "Activées" : "Désactivées"}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          onClick={toggle}
          disabled={loading}
          role="switch"
          aria-checked={subscribed}
          className={[
            "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0",
            "disabled:opacity-50",
            subscribed ? "bg-accent" : "bg-onyx/20",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
              subscribed ? "translate-x-5" : "translate-x-0",
            ].join(" ")}
          />
        </button>
      </div>

      {/* Message d'erreur */}
      {error ? (
        <p className="text-xs text-red-500 px-1">{error}</p>
      ) : null}
    </div>
  );
}
