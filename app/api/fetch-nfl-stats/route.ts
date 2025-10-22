import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // ✅ No schema prefix needed — Supabase defaults to 'public'
    const [qb, rb, wr] = await Promise.all([
      supabase.from("nfl_qb_recent_stats").select("*"),
      supabase.from("nfl_rb_recent_stats").select("*"),
      supabase.from("nfl_wr_recent_stats").select("*"),
    ]);

    if (qb.error || rb.error || wr.error) {
      return NextResponse.json(
        {
          success: false,
          error: qb.error?.message || rb.error?.message || wr.error?.message,
        },
        { status: 500 }
      );
    }

    // ✅ Merge all player stats into one array
    const merged = [
      ...(qb.data || []),
      ...(rb.data || []),
      ...(wr.data || []),
    ];

    return NextResponse.json({ success: true, stats: merged });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}











