"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getActiveEvent } from "@/lib/events";
import {
  getPerfectAttendanceAward,
  upsertPerfectAttendanceAward,
} from "@/lib/perfect-attendance";
import { uploadPerfectAttendanceImage } from "@/lib/storage";

export interface AwardFormState {
  error: string | null;
}

function optionalText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function saveAwardAction(
  _prevState: AwardFormState,
  formData: FormData
): Promise<AwardFormState> {
  await requireAdmin();

  const event = await getActiveEvent();
  if (!event) {
    return { error: "イベントが設定されていません。" };
  }

  const existing = await getPerfectAttendanceAward(event.id);
  let imageUrl = existing?.image_url ?? null;

  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    imageUrl = await uploadPerfectAttendanceImage(imageFile);
  }

  await upsertPerfectAttendanceAward(event.id, {
    imageUrl,
    title: optionalText(formData.get("title")),
    comment: optionalText(formData.get("comment")),
    extraText: optionalText(formData.get("extraText")),
  });

  revalidatePath("/admin/perfect-attendance");
  revalidatePath("/perfect-attendance");
  redirect("/admin/perfect-attendance");
}
