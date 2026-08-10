import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, createHmac, timingSafeEqual } from "crypto";

const ADMIN_COOKIE_NAME = "radio_taiso_admin_session";
const ADMIN_SESSION_DURATION_MS = 1000 * 60 * 60 * 12; // 12時間

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET が設定されていません。.env.local を確認してください。");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

/** 定数時間でパスワードを比較する (長さの違いによる早期リターンを避けるため双方をハッシュ化してから比較) */
export function verifyAdminPassword(inputPassword: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD が設定されていません。.env.local を確認してください。");
  }
  const inputHash = createHash("sha256").update(inputPassword).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(inputHash, expectedHash);
}

/** 管理者セッションのCookieを発行する (DBを使わずHMAC署名で検証するステートレスな方式) */
export async function createAdminSession(): Promise<void> {
  const expiresAt = Date.now() + ADMIN_SESSION_DURATION_MS;
  const payload = String(expiresAt);
  const signature = sign(payload);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires: new Date(expiresAt),
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!raw) return false;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return false;

  const expectedSignature = sign(payload);
  const signatureBuf = Buffer.from(signature, "hex");
  const expectedBuf = Buffer.from(expectedSignature, "hex");
  if (signatureBuf.length !== expectedBuf.length) return false;
  if (!timingSafeEqual(signatureBuf, expectedBuf)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

/** 管理画面ページで使う: 未認証なら /admin/login にリダイレクトする */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: ADMIN_COOKIE_NAME, path: "/admin" });
}
