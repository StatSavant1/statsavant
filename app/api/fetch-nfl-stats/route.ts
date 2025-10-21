import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Create Supabase client using environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Pull player props
    const { data: props, error: propsError } = await supabase
      .from("nfl_player_props_latest")
      .select("*");

    if (propsError) throw propsError;

    // Pull recent stat data from all 3 tables
    const [qbStats, rbStats, wrStats] = await Promise.all([
      supabase.from("nfl_qb_recent_stats").select("*"),
      supabase.from("nfl_rb_recent_stats").select("*"),
      supabase.from("nfl_wr_recent_stats").select("*"),
    ]);

    if (qbStats.error || rbStats.error || wrStats.error) {
      throw qbStats.error || rbStats.error || wrStats.error;
    }

    // Merge all recent stats into one unified array
    const recentStats = [
      ...(qbStats.data || []),
      ...(rbStats.data || []),
      ...(wrStats.data || []),
    ];

    // ✅ Return both datasets to the frontend
    return NextResponse.json({
      success: true,
      stats: props,
      recentStats,
    });
  } catch (error: any) {
    console.error("Fetch NFL Stats Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}







