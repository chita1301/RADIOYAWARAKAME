import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** 参加者がそのイベントで獲得済みのスタンプ数 (参加記録数) を取得する */
export async function getParticipantStampCount(
  participantId: string,
  eventId: string
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("participation_records")
    .select("id", { count: "exact", head: true })
    .eq("participant_id", participantId)
    .eq("event_id", eventId);

  if (error) throw error;
  return count ?? 0;
}

/** 参加者がそのイベントの指定日に既に参加記録を持っているか */
export async function hasParticipatedForDay(
  participantId: string,
  eventId: string,
  dayNumber: number
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("participation_records")
    .select("id")
    .eq("participant_id", participantId)
    .eq("event_id", eventId)
    .eq("day_number", dayNumber)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

/** 参加者がそのイベントで参加済みの日番号一覧を取得する */
export async function getParticipatedDayNumbers(
  participantId: string,
  eventId: string
): Promise<Set<number>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("participation_records")
    .select("day_number")
    .eq("participant_id", participantId)
    .eq("event_id", eventId);

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.day_number as number));
}

const UNIQUE_VIOLATION = "23505";

export type CheckInResult = { status: "created" } | { status: "already_done" };

/**
 * 参加記録を保存する。同じ日に何度呼ばれても (unique制約により) 一度しか記録されない。
 * 既に記録済みの場合は already_done を返す。
 */
export async function recordParticipation(
  participantId: string,
  eventId: string,
  dayNumber: number,
  participatedDate: string
): Promise<CheckInResult> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("participation_records").insert({
    participant_id: participantId,
    event_id: eventId,
    day_number: dayNumber,
    participated_date: participatedDate,
  });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { status: "already_done" };
    }
    throw error;
  }

  return { status: "created" };
}
