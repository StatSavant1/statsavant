import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("nfl_player_props_latest")
      .select("description, market, label, point, price, updated_at, home_team, away_team, bookmaker");

    if (error) throw error;

    // Rename "description" → "player" for consistency with frontend
    const formatted = data.map((row: any) => ({
      player: row.description,
      ...row,
    }));

    return NextResponse.json({ success: true, stats: formatted });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}





