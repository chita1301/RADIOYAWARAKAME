"use server";

import { redirect } from "next/navigation";
import { getOrCreateParticipant, InvalidLoginNameError } from "@/lib/participants";
import { createSession } from "@/lib/session";

export interface LoginFormState {
  error: string | null;
}

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const rawName = formData.get("loginName");
  if (typeof rawName !== "string") {
    return { error: "名前を入力してください" };
  }

  let participant;
  try {
    participant = await getOrCreateParticipant(rawName);
  } catch (err) {
    if (err instanceof InvalidLoginNameError) {
      return { error: err.message };
    }
    return { error: "登録に失敗しました。しばらくしてから再度お試しください。" };
  }

  await createSession(participant.id);
  redirect("/home");
}
