import { requireAdmin } from "@/lib/admin-auth";
import { AdminNav } from "@/components/AdminNav";
import { ResetForm } from "@/components/ResetForm";

export default async function AdminResetPage() {
  await requireAdmin();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <AdminNav />
      <h1 className="text-xl font-bold text-slate-900">データリセット</h1>
      <ResetForm />
    </div>
  );
}
