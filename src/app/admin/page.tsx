import { requireAdmin } from "@/lib/admin-auth";
import { getActiveEvent } from "@/lib/events";
import { getDashboardStats } from "@/lib/admin-stats";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const event = await getActiveEvent();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <AdminNav />
      <h1 className="text-xl font-bold text-slate-900">ダッシュボード</h1>

      {!event ? (
        <p className="text-slate-600">イベントが設定されていません。</p>
      ) : (
        <DashboardStats eventId={event.id} numDays={event.num_days} />
      )}
    </div>
  );
}

async function DashboardStats({
  eventId,
  numDays,
}: {
  eventId: string;
  numDays: number;
}) {
  const stats = await getDashboardStats(eventId, numDays);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="総参加者数" value={stats.totalParticipants} />
        <StatCard label="今日の参加者数" value={stats.todayParticipants} />
        <StatCard label="7日間達成者数" value={stats.perfectCount} />
        <StatCard label="皆勤率" value={`${stats.perfectRate.toFixed(1)}%`} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">
          日別参加者数・参加率
        </h2>
        <ul className="flex flex-col gap-2">
          {stats.dailyCounts.map(({ day, count, rate }) => (
            <li key={day} className="flex items-center gap-3">
              <span className="w-12 shrink-0 text-sm text-slate-600">{day}日目</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-sky-400"
                  style={{ width: `${Math.min(rate, 100)}%` }}
                />
              </div>
              <span className="w-28 shrink-0 text-right text-sm text-slate-600">
                {count}人 ({rate.toFixed(0)}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
