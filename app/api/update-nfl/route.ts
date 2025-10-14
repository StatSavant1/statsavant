import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // backend write access
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

    if (!Array.isArray(data)) {
      console.error("Unexpected API response:", data);
      throw new Error("Unexpected response format from The Odds API");
    }

    const allProps: any[] = [];

    // Loop through each game
    for (const game of data) {
      for (const book of game.bookmakers || []) {
        for (const market of book.markets || []) {
          // Group outcomes by player for merging O/U
          const rowsMap = new Map<string, any>();

          for (const o of market.outcomes || []) {
            const outcomeName = (o.name || "").toLowerCase();

            // Try multiple fields to extract player name
            const player =
              o.description ||
              o.participant ||
              o.player ||
              o.player_name ||
              (outcomeName !== "over" && outcomeName !== "under" ? o.name : "");

            if (!player) continue; // skip invalid rows

            const key = `${player}-${market.key}-${game.id}`;

            if (!rowsMap.has(key)) {
              rowsMap.set(key, {
                player_name: player,
                team: game.home_team,
                opponent: game.away_team,
                stat_type: market.key,
                line: o.point ?? null,
                over_odds: null,
                under_odds: null,
                source: book.title,
                updated_at: new Date().toISOString(),
              });
            }

            const row = rowsMap.get(key);

            // Set line if missing
            if (row.line == null && o.point != null) row.line = o.point;

            // Assign odds properly
            if (outcomeName === "over") {
              row.over_odds = o.price ?? row.over_odds;
            } else if (outcomeName === "under") {
              row.under_odds = o.price ?? row.under_odds;
            } else {
              // fallback if odds not labeled O/U
              if (row.over_odds == null) row.over_odds = o.price ?? null;
            }

            rowsMap.set(key, row);
          }

          // Push all merged rows
          allProps.push(...Array.from(rowsMap.values()));
        }
      }
    }

    console.log(`✅ Total props processed: ${allProps.length}`);
    console.log("Sample prop:", allProps[0]);

    if (allProps.length === 0) {
      return NextResponse.json({ success: false, message: "No prop data found." });
    }

    // Upsert into Supabase
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





