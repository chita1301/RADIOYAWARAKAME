"use client";

import { useActionState } from "react";
import {
  saveEventDatesAction,
  type EventSettingsFormState,
} from "@/app/admin/event/actions";
import type { EventRow } from "@/lib/events";

const initialState: EventSettingsFormState = { error: null };

const fieldClass =
  "rounded border border-slate-300 p-2 text-slate-900 outline-none focus:border-slate-500";
const labelClass = "flex flex-col gap-1 text-sm font-medium text-slate-700";

export function EventSettingsForm({ event }: { event: EventRow }) {
  const [state, formAction, isPending] = useActionState(saveEventDatesAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className={labelClass}>
        開始日
        <input
          type="date"
          name="startDate"
          defaultValue={event.start_date}
          required
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        終了日
        <input
          type="date"
          name="endDate"
          defaultValue={event.end_date}
          required
          className={fieldClass}
        />
      </label>
      <p className="text-xs text-slate-500">
        現在の設定: {event.num_days}日間 ({event.start_date} 〜 {event.end_date})。
        日数は開始日・終了日から自動的に計算されます。
      </p>

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
