"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { updateGroupNameAction } from "@/app/actions/lovers";

interface EditGroupNameProps {
  groupId: string;
  initialName: string;
}

export function EditGroupName({ groupId, initialName }: EditGroupNameProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  async function handleSave() {
    if (name.trim() === initialName) {
      setEditing(false);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await updateGroupNameAction(groupId, name);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setEditing(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setName(initialName);
      setEditing(false);
      setError(null);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={50}
            className="flex-1 rounded-xl border border-primary bg-white px-3 py-2 text-base font-bold text-text outline-none"
          />
          <button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            aria-label="Enregistrer"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-seashell disabled:opacity-40 transition-all active:scale-95"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            ) : (
              <Icon name="check" size={16} strokeWidth={2.5} />
            )}
          </button>
          <button
            onClick={() => { setName(initialName); setEditing(false); setError(null); }}
            aria-label="Annuler"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-onyx/12 text-text-muted transition-all hover:bg-onyx/5 active:scale-95"
          >
            <Icon name="x" size={16} strokeWidth={2.5} />
          </button>
        </div>
        {error ? (
          <p className="text-xs text-red-500 px-1">{error}</p>
        ) : (
          <p className="text-xs text-text-muted px-1">
            Entrée pour valider · Échap pour annuler
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="group flex items-center gap-2 text-left w-full"
      aria-label={`Renommer le groupe : ${name}`}
    >
      <span className="text-xl font-bold text-text leading-tight">{name}</span>
      <Icon
        name="pencil"
        size={14}
        className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
      />
    </button>
  );
}
