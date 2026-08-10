import { redirect } from "next/navigation";
import { getSessionParticipant } from "@/lib/session";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const participant = await getSessionParticipant();
  if (participant) {
    redirect("/home");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-gradient-to-b from-sky-50 to-amber-50 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-semibold tracking-wide text-amber-600">
          ラジオ体操スタンプラリー
        </p>
        <h1 className="text-2xl font-bold text-sky-900">スタンプカード</h1>
      </div>
      <LoginForm />
    </div>
  );
}
