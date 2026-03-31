"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginAction } from "@/app/actions/auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await loginAction(email, password);

    // Si on arrive ici c'est qu'il y a eu une erreur —
    // en cas de succès, la server action redirige et cette ligne n'est jamais atteinte.
    setLoading(false);
    setError(result.error);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
