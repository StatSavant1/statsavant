import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // ✅ Select without aliasing — Supabase parser-safe
    const selectColumns = [
      "player",
      "g1",
      "g2",
      "g3",
      "g4",
      "g5",
      "\"cover_%_l5\"",
      "avg_l_5",
      "delta_avg_to_line",
      "updated_at",
    ].join(", ");

    const [qb, rb, wr] = await Promise.all([
      supabase.from("nfl_qb_recent_stats").select(selectColumns),
      supabase.from("nfl_rb_recent_stats").select(selectColumns),
      supabase.from("nfl_wr_recent_stats").select(selectColumns),
    ]);

    if (qb.error || rb.error || wr.error) {
      console.error("Supabase fetch error:", qb.error || rb.error || wr.error);
      return NextResponse.json(
        {
          success: false,
          error: qb.error?.message || rb.error?.message || wr.error?.message,
        },
        { status: 500 }
      );
    }

    // ✅ Rename "cover_%_l5" → "cover_pct_l5" after fetching
    const renameField = (row: any) => {
      const { ["cover_%_l5"]: cover_pct_l5, ...rest } = row;
      return { ...rest, cover_pct_l5 };
    };

    const merged = [
      ...(qb.data?.map(renameField) || []),
      ...(rb.data?.map(renameField) || []),
      ...(wr.data?.map(renameField) || []),
    ];

    return NextResponse.json({
      success: true,
      count: merged.length,
      stats: merged,
    });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
















