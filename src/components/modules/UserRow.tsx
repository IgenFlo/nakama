"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { sendLoverRequestAction } from "@/app/actions/lovers";

export type RelationStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "same_group";

interface UserRowProps {
  userId: string;
  name: string;
  identifier: string | null;
  status: RelationStatus;
}

export function UserRow({ userId, name, identifier, status }: UserRowProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(status === "pending_sent");
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setError(null);
    const result = await sendLoverRequestAction(userId);
    setLoading(false);
    if (result.error) setError(result.error);
    else setSent(true);
  }

  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-lavender/60 flex items-center justify-center text-text-muted font-semibold text-sm shrink-0">
        {initial}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">{name}</p>
        {identifier ? (
          <p className="text-xs text-text-muted truncate">{identifier}</p>
        ) : null}
        {error ? <p className="text-xs text-red-500 mt-0.5">{error}</p> : null}
      </div>

      {/* Statut / Action */}
      {status === "same_group" ? (
        <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-accent">
          <Icon name="check" size={13} strokeWidth={2.5} />
          Groupe
        </span>
      ) : status === "pending_received" ? (
        <span className="shrink-0 text-xs text-text-muted">Reçue</span>
      ) : sent ? (
        <span className="shrink-0 inline-flex items-center gap-1 text-xs text-text-muted">
          <Icon name="clock" size={13} />
          En attente
        </span>
      ) : (
        <button
          onClick={handleSend}
          disabled={loading}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/15 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
            <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          ) : (
            <Icon name="userPlus" size={13} strokeWidth={2} />
          )}
          Inviter
        </button>
      )}
    </div>
  );
}
