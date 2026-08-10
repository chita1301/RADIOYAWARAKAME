import { requireAdmin } from "@/lib/admin-auth";
import { getActiveEvent } from "@/lib/events";
import { listStampsForEvent } from "@/lib/stamps";
import { getCardLayout } from "@/lib/card-layout";
import { AdminNav } from "@/components/AdminNav";
import { CardLayoutEditor } from "@/components/CardLayoutEditor";

export default async function AdminCardPage() {
  await requireAdmin();
  const event = await getActiveEvent();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <AdminNav />
      <h1 className="text-xl font-bold text-slate-900">スタンプカード配置</h1>

      {!event ? (
        <p className="text-slate-600">イベントが設定されていません。</p>
      ) : (
        <CardLayoutSection eventId={event.id} />
      )}
    </div>
  );
}

async function CardLayoutSection({ eventId }: { eventId: string }) {
  const [stamps, layout] = await Promise.all([
    listStampsForEvent(eventId),
    getCardLayout(eventId),
  ]);

  if (stamps.length === 0) {
    return (
      <p className="text-slate-600">
        先に「スタンプ管理」でスタンプを設定してから、ここでカード上の配置を編集できます。
      </p>
    );
  }

  return (
    <CardLayoutEditor
      backgroundImageUrl={layout.backgroundImageUrl}
      stamps={stamps.map((stamp) => ({
        id: stamp.id,
        dayNumber: stamp.day_number,
        name: stamp.name,
        imageUrl: stamp.image_url,
      }))}
      initialPositions={layout.stampPositions.map((position) => ({
        stampId: position.stampId,
        xPct: position.xPct,
        yPct: position.yPct,
        sizePct: position.sizePct,
        rotation: position.rotation,
      }))}
      initialNamePosition={layout.namePosition}
    />
  );
}
