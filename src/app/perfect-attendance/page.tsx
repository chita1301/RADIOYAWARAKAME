import Link from "next/link";
import { requireParticipant } from "@/lib/session";
import { getActiveEvent } from "@/lib/events";
import { getParticipantStampCount } from "@/lib/participation";
import { getPerfectAttendanceAward } from "@/lib/perfect-attendance";
import { AwardReveal } from "@/components/AwardReveal";

export default async function PerfectAttendancePage() {
  const participant = await requireParticipant();
  const event = await getActiveEvent();

  if (!event) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-slate-600">イベントが設定されていません。</p>
      </div>
    );
  }

  const stampCount = await getParticipantStampCount(participant.id, event.id);
  const isComplete = stampCount >= event.num_days;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-gradient-to-b from-sky-50 to-amber-50 px-6 py-16">
      <h1 className="text-xl font-bold text-sky-900">皆勤賞</h1>

      {isComplete ? (
        <AwardReveal award={await getPerfectAttendanceAward(event.id)} />
      ) : (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sky-800">
            7日間すべて参加すると皆勤賞が解放されます
          </p>
          <p className="text-sm text-sky-600">
            現在 {stampCount} / {event.num_days} スタンプ
          </p>
        </div>
      )}

      <Link href="/home" className="text-sm font-medium text-sky-600 underline">
        ホームに戻る
      </Link>
    </div>
  );
}
