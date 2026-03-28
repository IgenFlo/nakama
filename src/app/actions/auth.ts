"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginAction(
  identifier: string,
  password: string,
): Promise<{ error: string } | never> {
  try {
    await signIn("credentials", {
      identifier,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // next-auth relance NEXT_REDIRECT pour déclencher la navigation —
    // il faut le laisser remonter, c'est le chemin "succès".
    if (error instanceof AuthError) {
      return { error: "Identifiants incorrects" };
    }
    throw error;
  }

  // TypeScript : unreachable (signIn redirige toujours ou lance)
  return { error: "Erreur inattendue" };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
