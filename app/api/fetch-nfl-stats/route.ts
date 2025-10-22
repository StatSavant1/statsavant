import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // ✅ Explicitly query from the 'public' schema
    const [qb, rb, wr] = await Promise.all([
      supabase.from("public.nfl_qb_recent_stats").select("*"),
      supabase.from("public.nfl_rb_recent_stats").select("*"),
      supabase.from("public.nfl_wr_recent_stats").select("*"),
    ]);

    if (qb.error || rb.error || wr.error) {
      return NextResponse.json(
        { success: false, error: qb.error?.message || rb.error?.message || wr.error?.message },
        { status: 500 }
      );
    }

    // Merge all three tables into one array for frontend use
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










