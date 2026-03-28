"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createSubjectAction } from "@/app/actions/expenses";

interface AddSubjectFormProps {
  groupId: string;
}

export function AddSubjectForm({ groupId }: AddSubjectFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    const result = await createSubjectAction(groupId, name);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setName("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Ex : Vacances, Courses…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={error ?? undefined}
        className="flex-1"
      />
      <Button type="submit" loading={loading} disabled={!name.trim()}>
        Créer
      </Button>
    </form>
  );
}
