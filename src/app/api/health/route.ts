import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Supabase接続確認用の一時的なヘルスチェックAPI (Phase 1検証用) */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { error, count } = await supabase
      .from("participants")
      .select("id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        { status: "error", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "ok", participantsCount: count ?? 0 });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: err instanceof Error ? err.message : "unknown error" },
      { status: 500 }
    );
  }
}
