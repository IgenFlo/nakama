"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createUserAction } from "@/app/actions/admin";

interface CreateUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateUserForm({ onSuccess, onCancel }: CreateUserFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  function handleChange(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createUserAction({
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      password: form.password,
    });

    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        id="name"
        label="Nom"
        autoComplete="off"
        value={form.name}
        onChange={handleChange("name")}
        required
      />
      <Input
        id="email"
        label="Email (optionnel si téléphone renseigné)"
        type="email"
        autoComplete="off"
        autoCapitalize="none"
        value={form.email}
        onChange={handleChange("email")}
      />
      <Input
        id="phone"
        label="Téléphone (optionnel si email renseigné)"
        type="tel"
        autoComplete="off"
        value={form.phone}
        onChange={handleChange("phone")}
      />
      <Input
        id="password"
        label="Mot de passe temporaire"
        type="password"
        autoComplete="new-password"
        value={form.password}
        onChange={handleChange("password")}
        required
      />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          Créer
        </Button>
      </div>
    </form>
  );
}
