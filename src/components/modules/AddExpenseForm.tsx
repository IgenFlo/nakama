"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createExpenseAction } from "@/app/actions/expenses";

interface Member {
  id: string;
  name: string;
}

interface AddExpenseFormProps {
  subjectId: string;
  members: Member[];
  meId: string;
}

export function AddExpenseForm({ subjectId, members, meId }: AddExpenseFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidById, setPaidById] = useState(meId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(",", "."));
    if (!parsed || parsed <= 0) {
      setError("Montant invalide");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createExpenseAction({
      subjectId,
      amount: parsed,
      description: description || undefined,
      paidById,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setAmount("");
      setDescription("");
      setPaidById(meId);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Montant */}
      <Input
        label="Montant (€)"
        type="number"
        inputMode="decimal"
        min="0.01"
        step="0.01"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {/* Description */}
      <Input
        label="Description (optionnel)"
        placeholder="Restaurant, Transport…"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Payé par */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text">Payé par</label>
        <select
          value={paidById}
          onChange={(e) => setPaidById(e.target.value)}
          className="rounded-lg border border-lavender px-3 py-2.5 text-sm text-text bg-white outline-none focus:border-primary transition-colors"
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.id === meId ? `${m.name} (moi)` : m.name}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}

      <Button
        type="submit"
        loading={loading}
        disabled={!amount.trim()}
        className="w-full"
      >
        Ajouter
      </Button>
    </form>
  );
}
