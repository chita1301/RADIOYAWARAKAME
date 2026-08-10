import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface ParticipantProgress {
  id: string;
  loginName: string;
  completedDays: Set<number>;
  totalDays: number;
}

/** 参加者ごとの参加日数・達成日を一覧取得する */
export async function listParticipantsWithProgress(
  eventId: string
): Promise<ParticipantProgress[]> {
  const supabase = getSupabaseAdmin();

  const [participantsResult, recordsResult] = await Promise.all([
    supabase
      .from("participants")
      .select("id, login_name")
      .order("created_at", { ascending: true }),
    supabase
      .from("participation_records")
      .select("participant_id, day_number")
      .eq("event_id", eventId),
  ]);

  if (participantsResult.error) throw participantsResult.error;
  if (recordsResult.error) throw recordsResult.error;

  const daysByParticipant = new Map<string, Set<number>>();
  for (const row of recordsResult.data ?? []) {
    const set = daysByParticipant.get(row.participant_id) ?? new Set<number>();
    set.add(row.day_number);
    daysByParticipant.set(row.participant_id, set);
  }

  return (participantsResult.data ?? []).map((participant) => {
    const completedDays = daysByParticipant.get(participant.id) ?? new Set<number>();
    return {
      id: participant.id,
      loginName: participant.login_name,
      completedDays,
      totalDays: completedDays.size,
    };
  });
}
