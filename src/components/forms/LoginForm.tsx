"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginAction } from "@/app/actions/auth";

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await loginAction(identifier, password);

    // Si on arrive ici c'est qu'il y a eu une erreur —
    // en cas de succès, la server action redirige et cette ligne n'est jamais atteinte.
    setLoading(false);
    setError(result.error);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="identifier"
        label="Email ou téléphone"
        type="text"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        required
      />
      <Input
        id="password"
        label="Mot de passe"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error ? <p className="text-sm text-red-500 text-center">{error}</p> : null}
      <Button type="submit" loading={loading} className="w-full mt-2">
        Se connecter
      </Button>
    </form>
  );
}
