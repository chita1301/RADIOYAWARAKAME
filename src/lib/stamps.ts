import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface StampRow {
  id: string;
  event_id: string;
  day_number: number;
  name: string;
  image_url: string | null;
  author_name: string | null;
  author_comment: string | null;
  description: string | null;
  display_order: number;
}

export async function listStampsForEvent(eventId: string): Promise<StampRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("stamps")
    .select("*")
    .eq("event_id", eventId)
    .order("day_number", { ascending: true });

  if (error) throw error;
  return (data ?? []) as StampRow[];
}

export async function getStampForDay(
  eventId: string,
  dayNumber: number
): Promise<StampRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("stamps")
    .select("*")
    .eq("event_id", eventId)
    .eq("day_number", dayNumber)
    .maybeSingle();

  if (error) throw error;
  return data as StampRow | null;
}

export interface UpsertStampInput {
  name: string;
  imageUrl: string | null;
  authorName: string | null;
  authorComment: string | null;
  description: string | null;
  displayOrder: number;
}

/** (event_id, day_number) のunique制約に対して作成/更新する */
export async function upsertStamp(
  eventId: string,
  dayNumber: number,
  input: UpsertStampInput
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("stamps").upsert(
    {
      event_id: eventId,
      day_number: dayNumber,
      name: input.name,
      image_url: input.imageUrl,
      author_name: input.authorName,
      author_comment: input.authorComment,
      description: input.description,
      display_order: input.displayOrder,
    },
    { onConflict: "event_id,day_number" }
  );

  if (error) throw error;
}
