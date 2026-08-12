"use client";

import { useActionState } from "react";
import { loginAction, type LoginFormState } from "@/app/login/actions";

const initialState: LoginFormState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <label htmlFor="loginName" className="text-center text-base font-medium text-sky-900">
        あなたの名前を入力してください
      </label>
      <p className="text-center text-xs text-sky-700">
        名前はログインに使用されます。ログイン名はディスコードで使用しているものを推奨します。個人情報は入力しないでください。
      </p>
      <input
        id="loginName"
        name="loginName"
        type="text"
        required
        maxLength={50}
        autoComplete="off"
        placeholder="例: ちた"
        className="rounded-full border-2 border-sky-200 bg-white px-5 py-3 text-center text-lg text-sky-950 shadow-sm outline-none placeholder:text-sky-300 focus:border-sky-400"
      />
      {state.error && (
        <p role="alert" className="text-center text-sm font-medium text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-sky-500 px-5 py-3 text-lg font-bold text-white shadow-md transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "参加中..." : "参加する"}
      </button>
    </form>
  );
}
