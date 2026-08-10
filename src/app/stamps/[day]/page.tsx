import Link from "next/link";
import { notFound } from "next/navigation";
import { requireParticipant } from "@/lib/session";
import { getActiveEvent } from "@/lib/events";
import { getStampForDay } from "@/lib/stamps";
import { hasParticipatedForDay } from "@/lib/participation";

export default async function StampDetailPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const participant = await requireParticipant();
  const { day } = await params;
  const dayNumber = Number(day);

  const event = await getActiveEvent();
  if (
    !event ||
    !Number.isInteger(dayNumber) ||
    dayNumber < 1 ||
    dayNumber > event.num_days
  ) {
    notFound();
  }

  const unlocked = await hasParticipatedForDay(participant.id, event.id, dayNumber);
  if (!unlocked) {
    notFound();
  }

  const stamp = await getStampForDay(event.id, dayNumber);

  return (
    <div className="flex flex-1 flex-col items-center gap-4 bg-gradient-to-b from-sky-50 to-amber-50 px-6 py-12 text-center">
      <Link href="/stamps" className="self-start text-sm text-sky-600 underline">
        ← スタンプ一覧に戻る
      </Link>

      {!stamp ? (
        <p className="text-slate-600">この日のスタンプはまだ設定されていません。</p>
      ) : (
        <>
          {stamp.image_url && (
            // eslint-disable-next-line @next/next/no-img-element -- Supabase Storageの任意の公開URLを表示するため
            <img
              src={stamp.image_url}
              alt={stamp.name}
              className="h-48 w-48 rounded-full object-cover shadow-md"
            />
          )}
          <h1 className="text-xl font-bold text-sky-900">{stamp.name}</h1>
          {stamp.author_name && (
            <p className="text-sm text-sky-700">作者: {stamp.author_name}</p>
          )}
          {stamp.author_comment && (
            <p className="max-w-sm text-sm text-slate-700">{stamp.author_comment}</p>
          )}
          {stamp.description && (
            <p className="max-w-sm text-sm text-slate-600">{stamp.description}</p>
          )}
        </>
      )}
    </div>
  );
}
