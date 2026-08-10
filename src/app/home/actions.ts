"use server";

import { revalidatePath } from "next/cache";
import { requireParticipant } from "@/lib/session";
import { getActiveEvent, getCurrentDayNumber } from "@/lib/events";
import { getTodayInTokyo } from "@/lib/date";
import { recordParticipation } from "@/lib/participation";

export interface CheckInState {
  status: "idle" | "success" | "already_done" | "error";
  message: string | null;
}

export async function checkInAction(): Promise<CheckInState> {
  const participant = await requireParticipant();
  const event = await getActiveEvent();

  if (!event) {
    return { status: "error", message: "イベントが設定されていません。" };
  }

  const dayNumber = getCurrentDayNumber(event);
  if (dayNumber === null) {
    return { status: "error", message: "現在は参加受付期間外です。" };
  }

  const result = await recordParticipation(
    participant.id,
    event.id,
    dayNumber,
    getTodayInTokyo()
  );

  revalidatePath("/home");

  if (result.status === "already_done") {
    return { status: "already_done", message: "今日は参加済みです" };
  }

  return { status: "success", message: "今日の参加を記録しました！" };
}
