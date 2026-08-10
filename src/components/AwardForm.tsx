"use client";

import { useActionState } from "react";
import { saveAwardAction, type AwardFormState } from "@/app/admin/perfect-attendance/actions";
import type { PerfectAttendanceAward } from "@/lib/perfect-attendance";

const initialState: AwardFormState = { error: null };

const fieldClass =
  "rounded border border-slate-300 p-2 text-slate-900 outline-none focus:border-slate-500";
const labelClass = "flex flex-col gap-1 text-sm font-medium text-slate-700";

export function AwardForm({ award }: { award: PerfectAttendanceAward | null }) {
  const [state, formAction, isPending] = useActionState(saveAwardAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {award?.image_url && (
        // eslint-disable-next-line @next/next/no-img-element -- 管理画面のプレビューのみで、任意の外部URL(Supabase Storage)を表示するため next/image の固定ドメイン設定を避けている
        <img
          src={award.image_url}
          alt={award.title ?? "皆勤賞"}
          className="h-32 w-32 rounded-xl object-cover"
        />
      )}
      <label className={labelClass}>
        画像
        <input type="file" name="image" accept="image/*" className={fieldClass} />
      </label>
      <label className={labelClass}>
        タイトル
        <input
          type="text"
          name="title"
          defaultValue={award?.title ?? ""}
          maxLength={50}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        制作者コメント
        <textarea
          name="comment"
          defaultValue={award?.comment ?? ""}
          rows={2}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        その他の文章
        <textarea
          name="extraText"
          defaultValue={award?.extra_text ?? ""}
          rows={3}
          className={fieldClass}
        />
      </label>

      {state.error && (
        <p className="text-sm font-medium text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-slate-800 px-5 py-3 font-bold text-white shadow-md transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "保存中..." : "保存する"}
      </button>
    </form>
  );
}
