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
    const markets = "player_pass_yds,player_reception_yds,player_rush_yds";

  const response = await fetch(
  `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=${region}&markets=${markets}`
);

const data = await response.json();

console.log("🔍 Odds API Response Sample:", JSON.stringify(data, null, 2));

if (!Array.isArray(data)) {
  return NextResponse.json({
    success: false,
    error: "Unexpected response format",
    sample: data, // 👈 this will show us what The Odds API is actually returning
  });
}

    const allProps: any[] = [];

    // Loop through each game
    for (const game of data) {
      for (const book of game.bookmakers || []) {
        for (const market of book.markets || []) {
          const rowsMap = new Map<string, any>();

          for (const o of market.outcomes || []) {
            const outcomeName = (o.name || "").toLowerCase();

            // ✅ Correct player name extraction
            const player =
              o.description || // The Odds API usually stores player name here
              o.participant ||
              o.player ||
              o.player_name ||
              "";

            // Skip invalid rows
            if (!player || outcomeName === "over" || outcomeName === "under") continue;

            // Build unique key for each player/market/game combo
            const key = `${player}-${market.key}-${game.id}`;

            if (!rowsMap.has(key)) {
              rowsMap.set(key, {
                player_name: player,
                team: game.home_team,
                opponent: game.away_team,
                stat_type: market.key,
                line: null,
                over_odds: null,
                under_odds: null,
                source: book.title,
                updated_at: new Date().toISOString(),
              });
            }

            const row = rowsMap.get(key);

            // Assign odds by matching Over/Under outcomes
            if (outcomeName === "over") {
              row.line = o.point ?? row.line;
              row.over_odds = o.price ?? row.over_odds;
            } else if (outcomeName === "under") {
              row.line = o.point ?? row.line;
              row.under_odds = o.price ?? row.under_odds;
            }

            rowsMap.set(key, row);
          }

          // Push all merged player rows
          allProps.push(...Array.from(rowsMap.values()));
        }
      }
    }

    console.log(`✅ Total props processed: ${allProps.length}`);
    console.log("Sample prop:", allProps[0]);

    if (allProps.length === 0) {
      return NextResponse.json({ success: false, message: "No prop data found." });
    }

    // Upsert to Supabase
    const { error } = await supabase
      .from("nfl_player_props")
      .upsert(allProps, { onConflict: "player_name,stat_type,team" });

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






