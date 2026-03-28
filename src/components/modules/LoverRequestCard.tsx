"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { respondLoverRequestAction } from "@/app/actions/lovers";

interface LoverRequestCardProps {
  requestId: string;
  fromName: string;
  fromIdentifier: string | null;
}

export function LoverRequestCard({
  requestId,
  fromName,
  fromIdentifier,
}: LoverRequestCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(accept: boolean) {
    setLoading(accept ? "accept" : "reject");
    setError(null);
    const result = await respondLoverRequestAction(requestId, accept);
    setLoading(null);
    if (result.error) {
      setError(result.error);
    } else {
      setDone(true);
      if (accept && result.groupId) router.push(`/lovers/${result.groupId}`);
    }
  }

  if (done) return null;

  const initial = fromName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text">{fromName}</p>
          {fromIdentifier ? (
            <p className="text-xs text-text-muted truncate">{fromIdentifier}</p>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}

      <div className="flex gap-2">
        <button
          onClick={() => handle(true)}
          disabled={loading !== null}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-seashell py-2.5 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
        >
          {loading === "accept" ? (
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : (
            <Icon name="check" size={15} strokeWidth={2.5} />
          )}
          Accepter
        </button>
        <button
          onClick={() => handle(false)}
          disabled={loading !== null}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-onyx/12 bg-white text-text-muted py-2.5 text-sm font-medium transition-all hover:bg-onyx/5 active:scale-[0.97] disabled:opacity-50"
        >
          {loading === "reject" ? (
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : (
            <Icon name="x" size={15} strokeWidth={2.5} />
          )}
          Refuser
        </button>
      </div>
    </div>
  );
}
