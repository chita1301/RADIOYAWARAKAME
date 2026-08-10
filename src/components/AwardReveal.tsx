"use client";

import { useState } from "react";
import type { PerfectAttendanceAward } from "@/lib/perfect-attendance";

export function AwardReveal({ award }: { award: PerfectAttendanceAward | null }) {
  const [revealed, setRevealed] = useState(false);

  if (!revealed) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-lg font-bold text-amber-700">
          🎉 7日間達成おめでとうございます！
        </p>
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="rounded-full bg-amber-500 px-6 py-3 text-lg font-bold text-white shadow-md transition-colors hover:bg-amber-600"
        >
          皆勤賞を見る
        </button>
      </div>
    );
  }

  if (!award) {
    return <p className="text-slate-600">皆勤賞はまだ設定されていません。</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {award.image_url && (
        // eslint-disable-next-line @next/next/no-img-element -- Supabase Storageの任意の公開URLを表示するため
        <img
          src={award.image_url}
          alt={award.title ?? "皆勤賞"}
          className="h-48 w-48 rounded-2xl object-cover shadow-md"
        />
      )}
      {award.title && (
        <h1 className="text-xl font-bold text-amber-700">{award.title}</h1>
      )}
      {award.comment && (
        <p className="max-w-sm text-sm text-slate-700">{award.comment}</p>
      )}
      {award.extra_text && (
        <p className="max-w-sm text-sm text-slate-600">{award.extra_text}</p>
      )}
    </div>
  );
}
