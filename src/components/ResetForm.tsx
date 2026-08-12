"use client";

import { useActionState, useState } from "react";
import { resetParticipantsAction, type ResetFormState } from "@/app/admin/reset/actions";

const CONFIRM_PHRASE = "リセット";
const initialState: ResetFormState = { error: null, success: false };

export function ResetForm() {
  const [state, formAction, isPending] = useActionState(resetParticipantsAction, initialState);
  const [confirmText, setConfirmText] = useState("");
  const isMatch = confirmText === CONFIRM_PHRASE;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 text-sm text-red-800">
        <p className="font-bold">この操作は取り消せません</p>
        <p className="mt-1">
          すべての参加者アカウント・ログインセッション・参加記録(「今日やったよ！」の履歴)が完全に削除されます。
          スタンプ画像・カード配置・皆勤賞・イベント日程などの設定は削除されません。
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        確認のため「{CONFIRM_PHRASE}」と入力してください
        <input
          type="text"
          name="confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
          className="rounded border border-slate-300 p-2 text-slate-900 outline-none focus:border-red-500"
        />
      </label>

      {state.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm font-medium text-emerald-600">
          参加者データをリセットしました。
        </p>
      )}

      <button
        type="submit"
        disabled={!isMatch || isPending}
        className="rounded-full bg-red-600 px-5 py-3 font-bold text-white shadow-md transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? "削除中..." : "参加者データをリセットする"}
      </button>
    </form>
  );
}
