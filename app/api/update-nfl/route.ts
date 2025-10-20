import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log("🔄 Refreshing NFL player prop data from Supabase tables...");

    // Get latest data from QB, RB, WR tables
    const [qbs, rbs, wrs] = await Promise.all([
      supabase.from("nfl_qb_player_props").select("*"),
      supabase.from("nfl_rb_player_props").select("*"),
      supabase.from("nfl_wr_player_props").select("*"),
    ]);

    if (qbs.error || rbs.error || wrs.error) {
      throw new Error(
        `Supabase fetch error: ${qbs.error?.message || rbs.error?.message || wrs.error?.message}`
      );
    }

    // Merge all player props
    const combined = [...(qbs.data || []), ...(rbs.data || []), ...(wrs.data || [])];

    if (combined.length === 0) {
      return NextResponse.json({ success: false, error: "No data found in Supabase" });
    }

    // Write combined data to master table
    const { error } = await supabase
      .from("nfl_player_props_latest")
      .upsert(combined, { onConflict: "description, market, label" });

    if (error) throw error;

    return NextResponse.json({ success: true, inserted: combined.length });
  } catch (err: any) {
    console.error("Error in update-nfl:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}











