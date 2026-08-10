import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface StampPositionRow {
  dayNumber: number;
  stampId: string;
  xPct: number;
  yPct: number;
  sizePct: number;
  rotation: number;
}

export interface NamePosition {
  xPct: number;
  yPct: number;
  fontSize: number;
  color: string;
}

export interface CardLayout {
  backgroundImageUrl: string | null;
  stampPositions: StampPositionRow[];
  namePosition: NamePosition | null;
}

export async function getCardLayout(eventId: string): Promise<CardLayout> {
  const supabase = getSupabaseAdmin();

  const [cardSettingsResult, positionsResult, nameResult, stampsResult] = await Promise.all([
    supabase
      .from("card_settings")
      .select("background_image_url")
      .eq("event_id", eventId)
      .maybeSingle(),
    supabase.from("stamp_positions").select("*").eq("event_id", eventId),
    supabase
      .from("name_position_config")
      .select("*")
      .eq("event_id", eventId)
      .maybeSingle(),
    supabase.from("stamps").select("id, day_number").eq("event_id", eventId),
  ]);

  if (cardSettingsResult.error) throw cardSettingsResult.error;
  if (positionsResult.error) throw positionsResult.error;
  if (nameResult.error) throw nameResult.error;
  if (stampsResult.error) throw stampsResult.error;

  const dayByStampId = new Map(
    (stampsResult.data ?? []).map((stamp) => [stamp.id as string, stamp.day_number as number])
  );

  const stampPositions: StampPositionRow[] = (positionsResult.data ?? [])
    .map((position) => {
      const dayNumber = dayByStampId.get(position.stamp_id);
      if (dayNumber === undefined) return null;
      return {
        dayNumber,
        stampId: position.stamp_id as string,
        xPct: Number(position.x_pct),
        yPct: Number(position.y_pct),
        sizePct: Number(position.size_pct),
        rotation: Number(position.rotation),
      };
    })
    .filter((row): row is StampPositionRow => row !== null);

  const nameRow = nameResult.data;

  return {
    backgroundImageUrl: cardSettingsResult.data?.background_image_url ?? null,
    stampPositions,
    namePosition: nameRow
      ? {
          xPct: Number(nameRow.x_pct),
          yPct: Number(nameRow.y_pct),
          fontSize: nameRow.font_size,
          color: nameRow.color,
        }
      : null,
  };
}

export interface SaveCardLayoutInput {
  backgroundImageUrl?: string;
  stampPositions: {
    stampId: string;
    xPct: number;
    yPct: number;
    sizePct: number;
    rotation: number;
  }[];
  namePosition: NamePosition;
}

export async function saveCardLayout(
  eventId: string,
  input: SaveCardLayoutInput
): Promise<void> {
  const supabase = getSupabaseAdmin();

  if (input.backgroundImageUrl !== undefined) {
    const { error } = await supabase
      .from("card_settings")
      .upsert(
        { event_id: eventId, background_image_url: input.backgroundImageUrl },
        { onConflict: "event_id" }
      );
    if (error) throw error;
  }

  const { error: nameError } = await supabase.from("name_position_config").upsert(
    {
      event_id: eventId,
      x_pct: input.namePosition.xPct,
      y_pct: input.namePosition.yPct,
      font_size: input.namePosition.fontSize,
      color: input.namePosition.color,
    },
    { onConflict: "event_id" }
  );
  if (nameError) throw nameError;

  if (input.stampPositions.length > 0) {
    const { error: positionsError } = await supabase.from("stamp_positions").upsert(
      input.stampPositions.map((position) => ({
        event_id: eventId,
        stamp_id: position.stampId,
        x_pct: position.xPct,
        y_pct: position.yPct,
        size_pct: position.sizePct,
        rotation: position.rotation,
      })),
      { onConflict: "event_id,stamp_id" }
    );
    if (positionsError) throw positionsError;
  }
}
