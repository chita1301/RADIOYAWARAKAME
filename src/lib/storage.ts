import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const STAMP_IMAGES_BUCKET = "stamp-images";

async function uploadPublicImage(prefix: string, file: File): Promise<string> {
  const supabase = getSupabaseAdmin();
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const path = `${prefix}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(STAMP_IMAGES_BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(STAMP_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** スタンプ画像をSupabase Storageにアップロードし、公開URLを返す */
export async function uploadStampImage(dayNumber: number, file: File): Promise<string> {
  return uploadPublicImage(`day-${dayNumber}`, file);
}

/** 皆勤賞画像をSupabase Storageにアップロードし、公開URLを返す */
export async function uploadPerfectAttendanceImage(file: File): Promise<string> {
  return uploadPublicImage("award", file);
}

/** スタンプカード背景画像をSupabase Storageにアップロードし、公開URLを返す */
export async function uploadCardBackgroundImage(file: File): Promise<string> {
  return uploadPublicImage("card-background", file);
}
