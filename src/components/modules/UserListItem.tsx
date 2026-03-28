"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { resetPasswordAction } from "@/app/actions/admin";
import type { Role } from "@/generated/prisma/client";

interface UserListItemProps {
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: Role;
  };
}

export function UserListItem({ user }: UserListItemProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleReset() {
    setLoading(true);
    setFeedback(null);
    const result = await resetPasswordAction(user.id, password);
    setLoading(false);
    if ("error" in result) {
      setFeedback({ ok: false, msg: result.error });
    } else {
      setFeedback({ ok: true, msg: "Mot de passe réinitialisé" });
      setPassword("");
      setOpen(false);
    }
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <li className="flex flex-col gap-0 px-4">
      <div className="flex items-center gap-3 py-3">
        <div className="w-9 h-9 rounded-full bg-lavender/60 flex items-center justify-center text-text-muted font-semibold text-sm shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text truncate">{user.name}</p>
          <p className="text-xs text-text-muted truncate">
            {user.email ?? user.phone ?? "—"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={user.role === "ADMIN" ? "primary" : "neutral"}>
            {user.role === "ADMIN" ? "Admin" : "Ami"}
          </Badge>
          <button
            onClick={() => { setOpen((v) => !v); setFeedback(null); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-onyx/5 hover:text-text active:scale-95 transition-all"
            aria-label="Réinitialiser le mot de passe"
          >
            <Icon name="key" size={15} />
          </button>
        </div>
      </div>

      {open ? (
        <div className="flex flex-col gap-2.5 pb-3 pl-12">
          <Input
            id={`reset-${user.id}`}
            label="Nouveau mot de passe"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {feedback ? (
            <p className={`text-xs flex items-center gap-1 ${feedback.ok ? "text-accent" : "text-red-500"}`}>
              <Icon name={feedback.ok ? "check" : "x"} size={12} strokeWidth={2.5} />
              {feedback.msg}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1 text-xs py-2" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="secondary"
              className="flex-1 text-xs py-2"
              loading={loading}
              disabled={password.length < 8}
              onClick={handleReset}
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
