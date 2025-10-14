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

    const raw = await response.text();
    let data;

    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("❌ Failed to parse Odds API JSON:", raw);
      throw new Error("Invalid JSON from The Odds API");
    }

    // ✅ Log the structure to confirm what we’re dealing with
    console.log("🔍 Odds API Response Type:", typeof data);
    console.log("🔍 Odds API Keys:", Object.keys(data));

    // Handle different structures
    let games = [];
    if (Array.isArray(data)) {
      games = data;
    } else if (data.data && Array.isArray(data.data)) {
      games = data.data;
    } else if (data.bookmakers || data.market) {
      // fallback: single flattened format
      games = [data];
    } else {
      console.error("⚠️ Unrecognized Odds API format:", data);
      return NextResponse.json({
        success: false,
        error: "Unexpected response format from The Odds API",
        sample: data,
      });
    }

    const allProps: any[] = [];

    // Flatten props
    for (const game of games) {
      const home = game.home_team || "";
      const away = game.away_team || "";
      const commence_time = game.commence_time || null;

      for (const bookmaker of game.bookmakers || []) {
        const source = bookmaker.title || "Unknown";
        for (const market of bookmaker.markets || []) {
          for (const outcome of market.outcomes || []) {
            if (!outcome.description) continue;

            allProps.push({
              player_name: outcome.description, // ✅ from your spreadsheet
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

    // Upload to Supabase
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







