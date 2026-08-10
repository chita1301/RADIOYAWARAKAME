"use client";

import { useActionState } from "react";
import { adminLoginAction, type AdminLoginState } from "@/app/admin/login/actions";

const initialState: AdminLoginState = { error: null };

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(adminLoginAction, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <label htmlFor="password" className="text-center text-base font-medium text-slate-700">
        管理者パスワード
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="rounded-full border-2 border-slate-300 bg-white px-5 py-3 text-center text-lg text-slate-900 shadow-sm outline-none focus:border-slate-500"
      />
      {state.error && (
        <p role="alert" className="text-center text-sm font-medium text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-slate-800 px-5 py-3 text-lg font-bold text-white shadow-md transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "確認中..." : "ログイン"}
      </button>
    </form>
  );
}
