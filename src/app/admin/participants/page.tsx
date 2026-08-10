import { requireAdmin } from "@/lib/admin-auth";
import { getActiveEvent } from "@/lib/events";
import { listParticipantsWithProgress } from "@/lib/admin-participants";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminParticipantsPage() {
  await requireAdmin();
  const event = await getActiveEvent();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <AdminNav />
      <h1 className="text-xl font-bold text-slate-900">参加者一覧</h1>

      {!event ? (
        <p className="text-slate-600">イベントが設定されていません。</p>
      ) : (
        <ParticipantsTable eventId={event.id} numDays={event.num_days} />
      )}
    </div>
  );
}

async function ParticipantsTable({
  eventId,
  numDays,
}: {
  eventId: string;
  numDays: number;
}) {
  const participants = await listParticipantsWithProgress(eventId);
  const days = Array.from({ length: numDays }, (_, i) => i + 1);

  if (participants.length === 0) {
    return <p className="text-slate-600">まだ参加者がいません。</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="p-2">ログイン名</th>
            <th className="p-2">参加日数</th>
            {days.map((day) => (
              <th key={day} className="p-2 text-center">
                {day}日目
              </th>
            ))}
            <th className="p-2 text-center">皆勤</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((participant) => (
            <tr key={participant.id} className="border-b border-slate-100">
              <td className="p-2 font-medium text-slate-800">
                {participant.loginName}
              </td>
              <td className="p-2 text-slate-600">
                {participant.totalDays} / {numDays}
              </td>
              {days.map((day) => (
                <td key={day} className="p-2 text-center">
                  {participant.completedDays.has(day) ? "✅" : ""}
                </td>
              ))}
              <td className="p-2 text-center">
                {participant.totalDays >= numDays ? "🏆" : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
