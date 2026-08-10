import Link from "next/link";
import { requireParticipant } from "@/lib/session";
import { getActiveEvent, getCurrentDayNumber } from "@/lib/events";
import { getParticipantStampCount, hasParticipatedForDay } from "@/lib/participation";
import { CheckInButton } from "@/components/CheckInButton";

export default async function HomePage() {
  const participant = await requireParticipant();
  const event = await getActiveEvent();
  const totalDays = event?.num_days ?? 7;
  const dayNumber = event ? getCurrentDayNumber(event) : null;

  const [stampCount, alreadyDone] = await Promise.all([
    event ? getParticipantStampCount(participant.id, event.id) : Promise.resolve(0),
    event && dayNumber !== null
      ? hasParticipatedForDay(participant.id, event.id, dayNumber)
      : Promise.resolve(false),
  ]);

  return (
    <div className="flex flex-1 flex-col items-center gap-8 bg-gradient-to-b from-sky-50 to-amber-50 px-6 py-12">
      <h1 className="text-xl font-bold text-sky-900">
        こんにちは、{participant.login_name}さん！
      </h1>

      <section className="flex w-full max-w-sm flex-col items-center gap-3 rounded-3xl bg-white/80 p-6 shadow-sm">
        <p className="text-sm font-semibold text-amber-600">今日のラジオ体操</p>
        <CheckInButton dayNumber={dayNumber} alreadyDone={alreadyDone} />
        <p className="text-sm text-sky-700">
          現在 {stampCount} / {totalDays} スタンプ
        </p>
      </section>

      <nav className="flex w-full max-w-sm flex-col gap-3">
        <Link
          href="/stamps"
          className="rounded-full border-2 border-sky-300 bg-white px-5 py-3 text-center font-medium text-sky-700 shadow-sm"
        >
          スタンプを見る
        </Link>
        <Link
          href="/stamp-card"
          className="rounded-full border-2 border-sky-300 bg-white px-5 py-3 text-center font-medium text-sky-700 shadow-sm"
        >
          スタンプカード
        </Link>
        <Link
          href="/perfect-attendance"
          className="rounded-full border-2 border-amber-300 bg-white px-5 py-3 text-center font-medium text-amber-700 shadow-sm"
        >
          皆勤賞
        </Link>
      </nav>
    </div>
  );
}
