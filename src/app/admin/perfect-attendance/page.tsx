import { requireAdmin } from "@/lib/admin-auth";
import { getActiveEvent } from "@/lib/events";
import { getPerfectAttendanceAward } from "@/lib/perfect-attendance";
import { AwardForm } from "@/components/AwardForm";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminPerfectAttendancePage() {
  await requireAdmin();
  const event = await getActiveEvent();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <AdminNav />
      <h1 className="text-xl font-bold text-slate-900">皆勤賞管理</h1>

      {!event ? (
        <p className="text-slate-600">イベントが設定されていません。</p>
      ) : (
        <AwardFormSection eventId={event.id} />
      )}
    </div>
  );
}

async function AwardFormSection({ eventId }: { eventId: string }) {
  const award = await getPerfectAttendanceAward(eventId);
  return <AwardForm award={award} />;
}
