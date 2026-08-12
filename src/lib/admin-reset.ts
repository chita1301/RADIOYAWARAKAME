import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * 参加者データを全削除する (参加者アカウント・ログインセッション・参加記録)。
 * sessions / participation_records は participants への外部キーで
 * ON DELETE CASCADE が設定されているため、participants を削除すれば連鎖的に消える。
 * スタンプ・カード配置・皆勤賞・イベント設定などの管理データは対象外。
 */
export async function resetParticipantData(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("participants").delete().not("id", "is", null);
  if (error) throw error;
}
