"use server";

import { redirect } from "next/navigation";
import { createAdminSession, verifyAdminPassword } from "@/lib/admin-auth";

export interface AdminLoginState {
  error: string | null;
}

export async function adminLoginAction(
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0) {
    return { error: "パスワードを入力してください" };
  }

  if (!verifyAdminPassword(password)) {
    return { error: "パスワードが違います" };
  }

  await createAdminSession();
  redirect("/admin");
}
