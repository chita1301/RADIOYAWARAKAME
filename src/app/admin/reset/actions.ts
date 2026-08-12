"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { resetParticipantData } from "@/lib/admin-reset";

export interface ResetFormState {
  error: string | null;
  success: boolean;
}

const CONFIRM_PHRASE = "リセット";

export async function resetParticipantsAction(
  _prevState: ResetFormState,
  formData: FormData
): Promise<ResetFormState> {
  await requireAdmin();

  const confirm = formData.get("confirm");
  if (confirm !== CONFIRM_PHRASE) {
    return {
      error: `確認のため「${CONFIRM_PHRASE}」と入力してください`,
      success: false,
    };
  }

  await resetParticipantData();

  revalidatePath("/admin");
  revalidatePath("/admin/participants");
  revalidatePath("/home");
  revalidatePath("/stamps");
  revalidatePath("/stamp-card");
  revalidatePath("/perfect-attendance");

  return { error: null, success: true };
}
