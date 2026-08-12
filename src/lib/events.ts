import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { daysBetween, getTodayInTokyo } from "@/lib/date";

export interface EventRow {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  num_days: number;
}

/** 現在使用中のイベントを取得する (今回は7日間イベント1件のみを想定) */
export async function getActiveEvent(): Promise<EventRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("events")
    .select("id, name, description, start_date, end_date, num_days")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as EventRow | null;
}

/**
 * 日本時間の「今日」がイベントの何日目にあたるかを返す。
 * イベント期間外 (開始前・終了後) の場合は null を返す。
 */
export function getCurrentDayNumber(event: EventRow): number | null {
  const today = getTodayInTokyo();
  const dayNumber = daysBetween(event.start_date, today) + 1;
  if (dayNumber < 1 || dayNumber > event.num_days) return null;
  return dayNumber;
}

/** イベントの開始日・終了日を変更する。日数(num_days)は日付の差分から自動計算する */
export async function updateEventDates(
  eventId: string,
  startDate: string,
  endDate: string
): Promise<void> {
  const numDays = daysBetween(startDate, endDate) + 1;
  if (numDays < 1) {
    throw new Error("終了日は開始日以降の日付にしてください");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("events")
    .update({ start_date: startDate, end_date: endDate, num_days: numDays })
    .eq("id", eventId);

  if (error) throw error;
}
