import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getActiveEvent } from "@/lib/events";
import { listStampsForEvent } from "@/lib/stamps";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminStampsPage() {
  await requireAdmin();
  const event = await getActiveEvent();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <AdminNav />
      <h1 className="text-xl font-bold text-slate-900">スタンプ管理</h1>

      {!event ? (
        <p className="text-slate-600">イベントが設定されていません。</p>
      ) : (
        <StampSlotList eventId={event.id} numDays={event.num_days} />
      )}
    </div>
  );
}

async function StampSlotList({
  eventId,
  numDays,
}: {
  eventId: string;
  numDays: number;
}) {
  const stamps = await listStampsForEvent(eventId);
  const stampByDay = new Map(stamps.map((stamp) => [stamp.day_number, stamp]));
  const days = Array.from({ length: numDays }, (_, i) => i + 1);

  return (
    <ul className="flex flex-col gap-2">
      {days.map((day) => {
        const stamp = stampByDay.get(day);
        return (
          <li key={day}>
            <Link
              href={`/admin/stamps/${day}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-slate-400"
            >
              <span className="font-medium text-slate-800">{day}日目</span>
              <span className="text-sm text-slate-500">
                {stamp ? stamp.name : "未設定"}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
