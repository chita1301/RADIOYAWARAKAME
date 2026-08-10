import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getTodayInTokyo } from "@/lib/date";

export interface DailyCount {
  day: number;
  count: number;
  rate: number;
}

export interface DashboardStats {
  totalParticipants: number;
  todayParticipants: number;
  dailyCounts: DailyCount[];
  perfectCount: number;
  perfectRate: number;
}

export async function getDashboardStats(
  eventId: string,
  numDays: number
): Promise<DashboardStats> {
  const supabase = getSupabaseAdmin();

  const [participantsResult, recordsResult] = await Promise.all([
    supabase.from("participants").select("id", { count: "exact", head: true }),
    supabase
      .from("participation_records")
      .select("participant_id, day_number, participated_date")
      .eq("event_id", eventId),
  ]);

  if (participantsResult.error) throw participantsResult.error;
  if (recordsResult.error) throw recordsResult.error;

  const total = participantsResult.count ?? 0;
  const today = getTodayInTokyo();
  const rows = recordsResult.data ?? [];

  const todayParticipants = rows.filter((row) => row.participated_date === today).length;

  const countByDay = new Map<number, number>();
  const daysByParticipant = new Map<string, Set<number>>();

  for (const row of rows) {
    countByDay.set(row.day_number, (countByDay.get(row.day_number) ?? 0) + 1);
    const set = daysByParticipant.get(row.participant_id) ?? new Set<number>();
    set.add(row.day_number);
    daysByParticipant.set(row.participant_id, set);
  }

  const dailyCounts: DailyCount[] = Array.from({ length: numDays }, (_, i) => {
    const day = i + 1;
    const count = countByDay.get(day) ?? 0;
    return { day, count, rate: total > 0 ? (count / total) * 100 : 0 };
  });

  let perfectCount = 0;
  for (const days of daysByParticipant.values()) {
    if (days.size >= numDays) perfectCount++;
  }

  return {
    totalParticipants: total,
    todayParticipants,
    dailyCounts,
    perfectCount,
    perfectRate: total > 0 ? (perfectCount / total) * 100 : 0,
  };
}
