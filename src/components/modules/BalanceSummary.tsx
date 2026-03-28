import { Icon } from "@/components/ui/Icon";
import type { BalanceResult, Member } from "@/lib/balance";

interface BalanceSummaryProps {
  balance: BalanceResult;
  members: Member[];
  total: number;
  meId: string;
}

export function BalanceSummary({
  balance,
  members,
  total,
  meId,
}: BalanceSummaryProps) {
  const { transactions, totals, share } = balance;
  const isSettled = transactions.length === 0;

  return (
    <div className="rounded-2xl bg-white border border-onyx/8 shadow-[0_1px_4px_rgba(7,14,13,0.07)] overflow-hidden">
      {/* En-tête */}
      <div className="px-4 py-3 bg-primary/5 border-b border-onyx/6 flex items-center justify-between">
        <p className="text-xs font-semibold text-primary uppercase tracking-wide">
          Balance
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">
            {total.toFixed(2)} € total
          </span>
          <span className="text-xs font-medium text-text">
            {share.toFixed(2)} € / pers.
          </span>
        </div>
      </div>

      {/* Ce que chacun a payé */}
      <div className="px-4 py-3 space-y-2 border-b border-onyx/6">
        {members.map((m) => {
          const paid = totals[m.id] ?? 0;
          const net = balance.net[m.id] ?? 0;
          const isMe = m.id === meId;
          const isCreditor = net > 0.005;
          const isDebtor = net < -0.005;

          return (
            <div key={m.id} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-lavender/60 flex items-center justify-center text-text-muted font-semibold text-xs shrink-0">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <span className="flex-1 text-sm text-text">
                {isMe ? "Moi" : m.name}
              </span>
              <span className="text-xs text-text-muted">
                payé {paid.toFixed(2)} €
              </span>
              <span
                className={[
                  "text-xs font-semibold min-w-[52px] text-right",
                  isCreditor
                    ? "text-accent"
                    : isDebtor
                      ? "text-red-500"
                      : "text-text-muted",
                ].join(" ")}
              >
                {isCreditor
                  ? `+${net.toFixed(2)} €`
                  : isDebtor
                    ? `${net.toFixed(2)} €`
                    : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Virements */}
      <div className="px-4 py-3">
        {isSettled ? (
          <div className="flex items-center gap-2 text-accent">
            <Icon name="check" size={15} strokeWidth={2.5} />
            <span className="text-sm font-medium">Tout est équilibré</span>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((t, i) => {
              const fromMe = t.fromId === meId;
              const toMe = t.toId === meId;
              return (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span
                    className={fromMe ? "font-semibold text-red-500" : "text-text"}
                  >
                    {fromMe ? "Moi" : t.fromName}
                  </span>
                  <Icon
                    name="arrowRight"
                    size={13}
                    className="text-text-muted shrink-0"
                  />
                  <span
                    className={toMe ? "font-semibold text-accent" : "text-text"}
                  >
                    {toMe ? "moi" : t.toName}
                  </span>
                  <span className="ml-auto font-bold text-text">
                    {t.amount.toFixed(2)} €
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
