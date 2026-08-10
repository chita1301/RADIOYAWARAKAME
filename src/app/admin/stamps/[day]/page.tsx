import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getActiveEvent } from "@/lib/events";
import { getStampForDay } from "@/lib/stamps";
import { StampForm } from "@/components/StampForm";

export default async function AdminStampEditPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  await requireAdmin();
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

  const stamp = await getStampForDay(event.id, dayNumber);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-6">
      <Link href="/admin/stamps" className="text-sm text-slate-500 underline">
        ← スタンプ一覧に戻る
      </Link>
      <h1 className="text-xl font-bold text-slate-900">{dayNumber}日目のスタンプ</h1>
      <StampForm dayNumber={dayNumber} stamp={stamp} />
    </div>
  );
}
