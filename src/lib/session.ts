import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Participant } from "@/lib/participants";

const SESSION_COOKIE_NAME = "radio_taiso_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 90; // 90日

function hashToken(token: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET が設定されていません。.env.local を確認してください。");
  }
  return createHash("sha256").update(`${secret}:${token}`).digest("hex");
}

/** 参加者IDに対応する新しいセッションを作成し、httpOnly Cookieを発行する */
export async function createSession(participantId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("sessions").insert({
    participant_id: participantId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  if (error) throw error;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** 現在のリクエストのCookieから有効なセッションの参加者を取得する。未ログインならnull */
export async function getSessionParticipant(): Promise<Participant | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const supabase = getSupabaseAdmin();

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("participant_id, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (sessionError || !session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .select("*")
    .eq("id", session.participant_id)
    .maybeSingle();

  if (participantError || !participant) return null;
  return participant as Participant;
}

/** ログイン必須ページで使う: 未ログインなら "/" にリダイレクトする */
export async function requireParticipant(): Promise<Participant> {
  const participant = await getSessionParticipant();
  if (!participant) {
    redirect("/");
  }
  return participant;
}

/** ログアウト: Cookieを削除する (DB側のセッションレコードはexpires_atで自然に無効化される) */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
