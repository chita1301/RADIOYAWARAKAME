"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getActiveEvent } from "@/lib/events";
import { saveCardLayout, type SaveCardLayoutInput } from "@/lib/card-layout";
import { uploadCardBackgroundImage } from "@/lib/storage";

export interface CardLayoutFormState {
  error: string | null;
}

export async function saveCardLayoutAction(
  _prevState: CardLayoutFormState,
  formData: FormData
): Promise<CardLayoutFormState> {
  await requireAdmin();

  const event = await getActiveEvent();
  if (!event) {
    return { error: "イベントが設定されていません。" };
  }

  const positionsRaw = formData.get("positions");
  const namePositionRaw = formData.get("namePosition");
  if (typeof positionsRaw !== "string" || typeof namePositionRaw !== "string") {
    return { error: "配置データの送信に失敗しました。" };
  }

  let stampPositions: SaveCardLayoutInput["stampPositions"];
  let namePosition: SaveCardLayoutInput["namePosition"];
  try {
    stampPositions = JSON.parse(positionsRaw);
    namePosition = JSON.parse(namePositionRaw);
  } catch {
    return { error: "配置データの形式が不正です。" };
  }

  let backgroundImageUrl: string | undefined;
  const imageFile = formData.get("backgroundImage");
  if (imageFile instanceof File && imageFile.size > 0) {
    backgroundImageUrl = await uploadCardBackgroundImage(imageFile);
  }

  await saveCardLayout(event.id, { backgroundImageUrl, stampPositions, namePosition });

  revalidatePath("/admin/card");
  revalidatePath("/stamp-card");
  redirect("/admin/card");
}
