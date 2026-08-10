"use client";

import { useActionState } from "react";
import { saveStampAction, type StampFormState } from "@/app/admin/stamps/[day]/actions";
import type { StampRow } from "@/lib/stamps";

const initialState: StampFormState = { error: null };

const fieldClass =
  "rounded border border-slate-300 p-2 text-slate-900 outline-none focus:border-slate-500";
const labelClass = "flex flex-col gap-1 text-sm font-medium text-slate-700";

export function StampForm({
  dayNumber,
  stamp,
}: {
  dayNumber: number;
  stamp: StampRow | null;
}) {
  const action = saveStampAction.bind(null, dayNumber);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {stamp?.image_url && (
        // eslint-disable-next-line @next/next/no-img-element -- 管理画面のプレビューのみで、任意の外部URL(Supabase Storage)を表示するため next/image の固定ドメイン設定を避けている
        <img
          src={stamp.image_url}
          alt={stamp.name}
          className="h-32 w-32 rounded-xl object-cover"
        />
      )}
      <label className={labelClass}>
        画像
        <input type="file" name="image" accept="image/*" className={fieldClass} />
      </label>
      <label className={labelClass}>
        スタンプ名
        <input
          type="text"
          name="name"
          defaultValue={stamp?.name ?? ""}
          required
          maxLength={50}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        作者名
        <input
          type="text"
          name="authorName"
          defaultValue={stamp?.author_name ?? ""}
          maxLength={50}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        作者コメント
        <textarea
          name="authorComment"
          defaultValue={stamp?.author_comment ?? ""}
          rows={2}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        説明
        <textarea
          name="description"
          defaultValue={stamp?.description ?? ""}
          rows={3}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        表示順
        <input
          type="number"
          name="displayOrder"
          defaultValue={stamp?.display_order ?? dayNumber}
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
