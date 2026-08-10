import Link from "next/link";
import { requireParticipant } from "@/lib/session";
import { getActiveEvent } from "@/lib/events";
import { listStampsForEvent } from "@/lib/stamps";
import { getParticipatedDayNumbers } from "@/lib/participation";
import { getCardLayout } from "@/lib/card-layout";

export default async function StampCardPage() {
  const participant = await requireParticipant();
  const event = await getActiveEvent();

  if (!event) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-slate-600">イベントが設定されていません。</p>
      </div>
    );
  }

  const [stamps, unlockedDays, layout] = await Promise.all([
    listStampsForEvent(event.id),
    getParticipatedDayNumbers(participant.id, event.id),
    getCardLayout(event.id),
  ]);
  const stampByDay = new Map(stamps.map((stamp) => [stamp.day_number, stamp]));
  const days = Array.from({ length: event.num_days }, (_, i) => i + 1);
  const positionByStampId = new Map(layout.stampPositions.map((p) => [p.stampId, p]));
  const hasCustomLayout = layout.stampPositions.length > 0;

  return (
    <div className="flex flex-1 flex-col items-center gap-6 bg-gradient-to-b from-sky-50 to-amber-50 px-6 py-12">
      <h1 className="text-xl font-bold text-sky-900">スタンプカード</h1>

      {hasCustomLayout ? (
        <div
          className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl border-4 border-amber-200 bg-white shadow-md"
          style={
            layout.backgroundImageUrl
              ? {
                  backgroundImage: `url(${layout.backgroundImageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {days.map((day) => {
            const stamp = stampByDay.get(day);
            if (!stamp) return null;
            const pos = positionByStampId.get(stamp.id);
            if (!pos) return null;
            const unlocked = unlockedDays.has(day);

            return (
              <div
                key={day}
                className="absolute flex aspect-square items-center justify-center overflow-hidden rounded-full"
                style={{
                  left: `${pos.xPct}%`,
                  top: `${pos.yPct}%`,
                  width: `${pos.sizePct}%`,
                  transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
                }}
              >
                {unlocked && stamp.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Supabase Storageの任意の公開URLを表示するため
                  <img
                    src={stamp.image_url}
                    alt={stamp.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full rounded-full border-2 border-dashed border-sky-200 bg-sky-50/80" />
                )}
              </div>
            );
          })}

          {layout.namePosition && (
            <div
              className="absolute font-bold whitespace-nowrap"
              style={{
                left: `${layout.namePosition.xPct}%`,
                top: `${layout.namePosition.yPct}%`,
                transform: "translate(-50%, -50%)",
                fontSize: `${layout.namePosition.fontSize}px`,
                color: layout.namePosition.color,
              }}
            >
              {participant.login_name}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-sm rounded-3xl border-4 border-amber-200 bg-white p-6 shadow-md">
          <p className="mb-4 text-center text-lg font-bold text-sky-900">
            {participant.login_name}さんのカード
          </p>
          <div className="grid grid-cols-4 gap-3">
            {days.map((day) => {
              const stamp = stampByDay.get(day);
              const unlocked = unlockedDays.has(day);

              return (
                <div
                  key={day}
                  className="flex aspect-square flex-col items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-sky-200 bg-sky-50"
                >
                  {unlocked && stamp && stamp.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Supabase Storageの任意の公開URLを表示するため
                    <img
                      src={stamp.image_url}
                      alt={stamp.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-sky-300">{day}</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">
            ※ 管理画面でカードの配置を設定すると、デザインされたカードで表示されます
          </p>
        </div>
      )}

      <Link href="/home" className="text-sm font-medium text-sky-600 underline">
        ホームに戻る
      </Link>
    </div>
  );
}
