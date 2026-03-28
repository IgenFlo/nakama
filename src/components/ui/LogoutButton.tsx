"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { logoutAction } from "@/app/actions/auth";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await logoutAction();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-100 active:scale-[0.98] disabled:opacity-50"
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      ) : (
        <Icon name="logOut" size={16} />
      )}
      Se déconnecter
    </button>
  );
}
