import { redirect } from "next/navigation";

// /admin redirige vers /admin/users
export default function AdminPage() {
  redirect("/admin/users");
}
