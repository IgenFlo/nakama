"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { CreateUserForm } from "@/components/forms/CreateUserForm";

export function AdminUsersClient() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  function handleSuccess() {
    setShowForm(false);
    // Recharge le Server Component pour afficher le nouvel utilisateur
    router.refresh();
  }

  if (showForm) {
    return (
      <Card>
        <h2 className="text-sm font-semibold text-text mb-3">Nouvel utilisateur</h2>
        <CreateUserForm
          onSuccess={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      </Card>
    );
  }

  return (
    <Button onClick={() => setShowForm(true)} className="w-full gap-2">
      <Icon name="plus" size={16} />
      Ajouter un utilisateur
    </Button>
  );
}
