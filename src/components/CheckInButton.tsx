"use client";

import { useActionState } from "react";
import { checkInAction, type CheckInState } from "@/app/home/actions";

export function CheckInButton({
  dayNumber,
  alreadyDone,
}: {
  dayNumber: number | null;
  alreadyDone: boolean;
}) {
  const initialState: CheckInState = alreadyDone
    ? { status: "already_done", message: "今日は参加済みです" }
    : { status: "idle", message: null };

  const [state, formAction, isPending] = useActionState(
    checkInAction,
    initialState
  );

  if (dayNumber === null) {
    return (
      <p className="text-sm font-medium text-sky-700">
        現在は参加受付期間外です
      </p>
    );
  }

  const isDone = state.status === "success" || state.status === "already_done";

  return (
    <form action={formAction} className="flex w-full flex-col items-center gap-2">
      <button
        type="submit"
        disabled={isDone || isPending}
        className={`w-full rounded-full px-5 py-3 text-lg font-bold text-white shadow-md transition-colors ${
          isDone
            ? "cursor-not-allowed bg-emerald-400"
            : "bg-sky-500 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
        }`}
      >
        {isDone ? "今日はやったよ！" : isPending ? "記録中..." : "今日やったよ！"}
      </button>
      {state.status === "success" && (
        <p className="text-sm font-semibold text-emerald-600">
          🎉 {state.message}
        </p>
      )}
      {state.status === "already_done" && (
        <p className="text-sm text-sky-700">{state.message}</p>
      )}
      {state.status === "error" && (
        <p className="text-sm font-medium text-red-600">{state.message}</p>
      )}
    </form>
  );
}
