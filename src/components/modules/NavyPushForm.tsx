"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

interface NavyPushFormProps {
  groupId: string;
}

export function NavyPushForm({ groupId }: NavyPushFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleSend() {
    const trimmed = message.trim();
    if (!trimmed) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/navy-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, message: trimmed }),
      });

      const data = (await res.json()) as { error?: string; sent?: number };

      if (!res.ok) {
        setFeedback({ type: "error", text: data.error ?? "Erreur inconnue" });
      } else {
        setMessage("");
        const sent = data.sent ?? 0;
        setFeedback({
          type: "success",
          text:
            sent > 0
              ? `Envoyé à ${sent} personne${sent > 1 ? "s" : ""}`
              : "Envoyé (aucune subscription active)",
        });

        if (cooldownRef.current) clearTimeout(cooldownRef.current);
        cooldownRef.current = setTimeout(() => setFeedback(null), 4000);

        router.refresh();
      }
    } catch {
      setFeedback({ type: "error", text: "Erreur réseau" });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ton message…"
        maxLength={200}
        rows={3}
        className="w-full rounded-xl border border-onyx/15 px-3.5 py-2.5 text-sm text-text bg-white outline-none transition-colors resize-none placeholder:text-text-muted focus:border-primary"
      />

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-text-muted">{message.length}/200</span>
        <button
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-seashell px-4 py-2.5 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-40"
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : (
            <Icon name="send" size={14} />
          )}
          Envoyer
        </button>
      </div>

      {feedback ? (
        <div
          className={[
            "flex items-center gap-2 text-sm font-medium",
            feedback.type === "success" ? "text-accent" : "text-red-500",
          ].join(" ")}
        >
          <Icon
            name={feedback.type === "success" ? "check" : "x"}
            size={14}
            strokeWidth={2.5}
          />
          {feedback.text}
        </div>
      ) : null}
    </div>
  );
}
