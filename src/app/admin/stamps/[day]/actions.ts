"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getActiveEvent } from "@/lib/events";
import { getStampForDay, upsertStamp } from "@/lib/stamps";
import { uploadStampImage } from "@/lib/storage";

export interface StampFormState {
  error: string | null;
}

function optionalText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function saveStampAction(
  dayNumber: number,
  _prevState: StampFormState,
  formData: FormData
): Promise<StampFormState> {
  await requireAdmin();

  const event = await getActiveEvent();
  if (!event) {
    return { error: "イベントが設定されていません。" };
  }

  const name = formData.get("name");
  if (typeof name !== "string" || name.trim().length === 0) {
    return { error: "スタンプ名を入力してください" };
  }

  const displayOrder = Number(formData.get("displayOrder"));

  const existing = await getStampForDay(event.id, dayNumber);
  let imageUrl = existing?.image_url ?? null;

  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    imageUrl = await uploadStampImage(dayNumber, imageFile);
  }

  await upsertStamp(event.id, dayNumber, {
    name: name.trim(),
    imageUrl,
    authorName: optionalText(formData.get("authorName")),
    authorComment: optionalText(formData.get("authorComment")),
    description: optionalText(formData.get("description")),
    displayOrder: Number.isFinite(displayOrder) ? displayOrder : dayNumber,
  });

  revalidatePath("/admin/stamps");
  revalidatePath(`/admin/stamps/${dayNumber}`);
  redirect("/admin/stamps");
}
