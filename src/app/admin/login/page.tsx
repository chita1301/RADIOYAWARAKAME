import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-slate-100 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-semibold tracking-wide text-slate-500">
          ラジオ体操スタンプラリー
        </p>
        <h1 className="text-2xl font-bold text-slate-900">管理画面ログイン</h1>
      </div>
      <AdminLoginForm />
    </div>
  );
}
