import Link from "next/link";
import { requireParticipant } from "@/lib/session";
import { getActiveEvent } from "@/lib/events";
import { listStampsForEvent } from "@/lib/stamps";
import { getParticipatedDayNumbers } from "@/lib/participation";

export default async function StampsPage() {
  const participant = await requireParticipant();
  const event = await getActiveEvent();

  if (!event) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-slate-600">イベントが設定されていません。</p>
      </div>
    );
  }

  const [stamps, unlockedDays] = await Promise.all([
    listStampsForEvent(event.id),
    getParticipatedDayNumbers(participant.id, event.id),
  ]);
  const stampByDay = new Map(stamps.map((stamp) => [stamp.day_number, stamp]));
  const days = Array.from({ length: event.num_days }, (_, i) => i + 1);

  return (
    <div className="flex flex-1 flex-col items-center gap-6 bg-gradient-to-b from-sky-50 to-amber-50 px-6 py-12">
      <h1 className="text-xl font-bold text-sky-900">スタンプ一覧</h1>

      <ul className="grid w-full max-w-sm grid-cols-2 gap-4">
        {days.map((day) => {
          const stamp = stampByDay.get(day);
          const unlocked = unlockedDays.has(day);

          if (!unlocked) {
            return (
              <li
                key={day}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 text-slate-400"
              >
                <span className="text-2xl">🔒</span>
                <span className="text-xs font-medium">{day}日目 未獲得</span>
              </li>
            );
          }

          if (!stamp) {
            return (
              <li
                key={day}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 text-slate-400"
              >
                <span className="text-xs font-medium">{day}日目 未設定</span>
              </li>
            );
          }

          return (
            <li key={day}>
              <Link
                href={`/stamps/${day}`}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-sky-300 bg-white p-2 text-center shadow-sm transition-colors hover:border-sky-500"
              >
                {stamp.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element -- Supabase Storageの任意の公開URLを表示するため
                  <img
                    src={stamp.image_url}
                    alt={stamp.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                )}
                <span className="text-xs font-medium text-sky-800">{stamp.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link href="/home" className="text-sm font-medium text-sky-600 underline">
        ホームに戻る
      </Link>
    </div>
  );
}
