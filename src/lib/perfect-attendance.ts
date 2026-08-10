import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface PerfectAttendanceAward {
  event_id: string;
  image_url: string | null;
  title: string | null;
  comment: string | null;
  extra_text: string | null;
}

export async function getPerfectAttendanceAward(
  eventId: string
): Promise<PerfectAttendanceAward | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("perfect_attendance_award")
    .select("*")
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) throw error;
  return data as PerfectAttendanceAward | null;
}

export interface UpsertAwardInput {
  imageUrl: string | null;
  title: string | null;
  comment: string | null;
  extraText: string | null;
}

export async function upsertPerfectAttendanceAward(
  eventId: string,
  input: UpsertAwardInput
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("perfect_attendance_award").upsert(
    {
      event_id: eventId,
      image_url: input.imageUrl,
      title: input.title,
      comment: input.comment,
      extra_text: input.extraText,
    },
    { onConflict: "event_id" }
  );

  if (error) throw error;
}
