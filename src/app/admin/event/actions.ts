"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getActiveEvent, updateEventDates } from "@/lib/events";

export interface EventSettingsFormState {
  error: string | null;
}

export async function saveEventDatesAction(
  _prevState: EventSettingsFormState,
  formData: FormData
): Promise<EventSettingsFormState> {
  await requireAdmin();

  const event = await getActiveEvent();
  if (!event) {
    return { error: "イベントが設定されていません。" };
  }

  const startDate = formData.get("startDate");
  const endDate = formData.get("endDate");
  if (typeof startDate !== "string" || typeof endDate !== "string" || !startDate || !endDate) {
    return { error: "開始日・終了日を入力してください" };
  }

  try {
    await updateEventDates(event.id, startDate, endDate);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "保存に失敗しました。",
    };
  }

  revalidatePath("/admin/event");
  revalidatePath("/admin");
  revalidatePath("/home");
  revalidatePath("/stamps");
  revalidatePath("/stamp-card");
  revalidatePath("/perfect-attendance");
  redirect("/admin/event");
}
