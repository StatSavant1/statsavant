import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ODDS_API_KEY!;
    const sport = "americanfootball_nfl";
    const region = "us";
    const markets = "player_props";

    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=${region}&markets=${markets}`
    );

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Unexpected response format from The Odds API:", data);
      throw new Error("Unexpected response format from The Odds API");
    }

    const allProps: any[] = [];

    // Flatten the odds data
    for (const game of data) {
      const home = game.home_team;
      const away = game.away_team;
      const commence_time = game.commence_time;

      for (const bookmaker of game.bookmakers || []) {
        const source = bookmaker.title;
        for (const market of bookmaker.markets || []) {
          for (const outcome of market.outcomes || []) {
            if (!outcome.description) continue; // skip invalid

            allProps.push({
              player_name: outcome.description, // ✅ player name
              team: home,
              opponent: away,
              stat_type: market.key || market.name || "",
              line: outcome.point ?? null,
              label: outcome.name || "", // Over / Under
              odds: outcome.price ?? null,
              source,
              commence_time,
              updated_at: new Date().toISOString(),
            });
          }
        }
      }
    }

    console.log(`✅ Total props processed: ${allProps.length}`);
    console.log("Sample prop:", allProps[0]);

    if (allProps.length === 0) {
      return NextResponse.json({ success: false, message: "No prop data found." });
    }

    // Save to Supabase
    const { error } = await supabase
      .from("nfl_player_props")
      .upsert(allProps, { onConflict: "player_name,team,stat_type,label" });

    if (error) {
      console.error("Supabase upsert error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, inserted: allProps.length });
  } catch (err: any) {
    console.error("Error in update-nfl:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}







