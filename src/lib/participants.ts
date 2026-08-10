import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 50;

export class InvalidLoginNameError extends Error {}

export interface Participant {
  id: string;
  login_name: string;
  created_at: string;
}

/** 前後の空白を除去し、連続する空白を1つにまとめ、文字数を検証する */
export function normalizeLoginName(rawName: string): string {
  const trimmed = rawName.trim().replace(/\s+/g, " ");
  if (trimmed.length < MIN_NAME_LENGTH || trimmed.length > MAX_NAME_LENGTH) {
    throw new InvalidLoginNameError(
      `ログイン名は${MIN_NAME_LENGTH}〜${MAX_NAME_LENGTH}文字で入力してください`
    );
  }
  return trimmed;
}

/**
 * ログイン名から参加者を取得し、存在しなければ新規登録する。
 * 同じログイン名がすでに登録されている場合は既存の参加者として扱う。
 */
export async function getOrCreateParticipant(
  rawLoginName: string
): Promise<Participant> {
  const loginName = normalizeLoginName(rawLoginName);
  const supabase = getSupabaseAdmin();

  const { data: existing, error: selectError } = await supabase
    .from("participants")
    .select("*")
    .eq("login_name", loginName)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return existing as Participant;

  const { data: created, error: insertError } = await supabase
    .from("participants")
    .insert({ login_name: loginName })
    .select("*")
    .single();

  if (insertError) {
    // 同時に同じ名前で登録されたレースの場合、既存レコードを再取得する
    const { data: raceExisting } = await supabase
      .from("participants")
      .select("*")
      .eq("login_name", loginName)
      .maybeSingle();
    if (raceExisting) return raceExisting as Participant;
    throw insertError;
  }

  return created as Participant;
}
