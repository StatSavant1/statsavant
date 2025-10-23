import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Fetch all three tables
    const [qb, rb, wr] = await Promise.all([
      supabase.from("nfl_qb_recent_stats").select("*"),
      supabase.from("nfl_rb_recent_stats").select("*"),
      supabase.from("nfl_wr_recent_stats").select("*"),
    ]);

    // Check for query errors
    if (qb.error || rb.error || wr.error) {
      return NextResponse.json(
        {
          success: false,
          error: qb.error?.message || rb.error?.message || wr.error?.message,
        },
        { status: 500 }
      );
    }

    // Merge all stats into one array
    const merged = [
      ...(qb.data || []),
      ...(rb.data || []),
      ...(wr.data || []),
    ].map((row) => ({
      player: row.player || null,
      g1: row.g1 ?? null,
      g2: row.g2 ?? null,
      g3: row.g3 ?? null,
      g4: row.g4 ?? null,
      g5: row.g5 ?? null,
      cover_pct_l5: row["cover_%_l5"] ?? null,
      avg_l5: row["avg_l_5"] ?? null,
      delta_avg_to_line: row["delta_avg_to_line"] ?? null,
      updated_at: row.updated_at ?? null,
    }));

    return NextResponse.json({ success: true, stats: merged });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}












