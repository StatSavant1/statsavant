import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Use your environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // ✅ Pull data from each table
    const [qb, rb, wr] = await Promise.all([
      supabase.from("nfl_qb_recent_stats").select(
        "player, g1, g2, g3, g4, g5, cover_%_l5, avg_l_5, delta_avg_to_line, updated_at"
      ),
      supabase.from("nfl_rb_recent_stats").select(
        "player, g1, g2, g3, g4, g5, cover_%_l5, avg_l_5, delta_avg_to_line, updated_at"
      ),
      supabase.from("nfl_wr_recent_stats").select(
        "player, g1, g2, g3, g4, g5, cover_%_l5, avg_l_5, delta_avg_to_line, updated_at"
      ),
    ]);

    // ✅ Check for errors
    if (qb.error || rb.error || wr.error) {
      console.error("Supabase fetch error:", qb.error || rb.error || wr.error);
      return NextResponse.json(
        { success: false, error: qb.error?.message || rb.error?.message || wr.error?.message },
        { status: 500 }
      );
    }

    // ✅ Combine results
    const merged = [...(qb.data || []), ...(rb.data || []), ...(wr.data || [])];

    // ✅ Return success
    return NextResponse.json({ success: true, stats: merged, count: merged.length });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}













