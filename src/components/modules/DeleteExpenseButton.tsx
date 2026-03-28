"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { deleteExpenseAction } from "@/app/actions/expenses";

interface DeleteExpenseButtonProps {
  expenseId: string;
}

export function DeleteExpenseButton({ expenseId }: DeleteExpenseButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Supprimer cette dépense ?")) return;
    setLoading(true);
    await deleteExpenseAction(expenseId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      aria-label="Supprimer la dépense"
      className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all disabled:opacity-40"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Icon name="trash" size={15} />
      )}
    </button>
  );
}
