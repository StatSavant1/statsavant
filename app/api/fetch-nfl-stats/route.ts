import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // 1️⃣ Fetch latest player prop lines
    const [qb, rb, wr] = await Promise.all([
      supabase.from("nfl_qb_latest_props").select("*"),
      supabase.from("nfl_rb_latest_props").select("*"),
      supabase.from("nfl_wr_latest_props").select("*"),
    ]);

    if (qb.error || rb.error || wr.error) {
      throw new Error(
        `Error fetching latest props: ${qb.error?.message || rb.error?.message || wr.error?.message}`
      );
    }

    // 2️⃣ Fetch recent stat trends
    const [qbStats, rbStats, wrStats] = await Promise.all([
      supabase.from("nfl_qb_recent_stats").select("*"),
      supabase.from("nfl_rb_recent_stats").select("*"),
      supabase.from("nfl_wr_recent_stats").select("*"),
    ]);

    if (qbStats.error || rbStats.error || wrStats.error) {
      throw new Error(
        `Error fetching recent stats: ${qbStats.error?.message || rbStats.error?.message || wrStats.error?.message}`
      );
    }

    // 3️⃣ Merge all prop and stat data into single arrays
    const allProps = [
      ...(qb.data || []),
      ...(rb.data || []),
      ...(wr.data || []),
    ];

    const allStats = [
      ...(qbStats.data || []),
      ...(rbStats.data || []),
      ...(wrStats.data || []),
    ];

    // 4️⃣ Combine props + stats per player name
    const merged = allProps.map((prop) => {
      const playerStats = allStats.find(
        (s) => s.player?.toLowerCase().trim() === prop.player?.toLowerCase().trim()
      );
      return {
        ...prop,
        ...playerStats,
      };
    });

    // 5️⃣ Determine latest update timestamp across datasets
    const latestUpdatedAt = [
      ...(allProps.map((p) => p.updated_at).filter(Boolean) as string[]),
      ...(allStats.map((s) => s.updated_at).filter(Boolean) as string[]),
    ]
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return NextResponse.json({
      success: true,
      count: merged.length,
      latest_updated_at: latestUpdatedAt || null,
      stats: merged,
    });
  } catch (err: any) {
    console.error("❌ Error in fetch-nfl-stats:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}






















