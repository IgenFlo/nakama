"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { getNavyPushHistoryAction, type NavyPushItem } from "@/app/actions/lovers";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

interface NavyPushHistoryProps {
  groupId: string;
  initialItems: NavyPushItem[];
  initialNextCursor: string | null;
}

export function NavyPushHistory({
  groupId,
  initialItems,
  initialNextCursor,
}: NavyPushHistoryProps) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await getNavyPushHistoryAction(groupId, nextCursor);
      setItems((prev) => [...prev, ...result.items]);
      setNextCursor(result.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }, [groupId, nextCursor, loadingMore]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-text-muted">
        <Icon name="clock" size={32} strokeWidth={1.5} className="mb-2 opacity-40" />
        <p className="text-sm">Aucun Navy Push envoyé</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon name="clock" size={16} className="text-text-muted" />
        <h2 className="text-sm font-semibold text-text">Historique</h2>
      </div>

      <Card className="!p-0">
        <div className="divide-y divide-onyx/6">
          {items.map((item) => {
            const initial = item.triggeredBy.name.charAt(0).toUpperCase();
            return (
              <div key={item.id} className="flex items-start gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary text-xs font-bold">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-text truncate">
                      {item.triggeredBy.name}
                    </p>
                    <p className="text-xs text-text-muted shrink-0">
                      {relativeTime(item.createdAt)}
                    </p>
                  </div>
                  {item.message ? (
                    <p className="text-sm text-text-muted mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {nextCursor ? (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full py-2.5 text-sm font-medium text-primary hover:opacity-80 active:scale-[0.98] transition-all disabled:opacity-40"
        >
          {loadingMore ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Chargement…
            </span>
          ) : (
            "Charger plus"
          )}
        </button>
      ) : null}
    </div>
  );
}
