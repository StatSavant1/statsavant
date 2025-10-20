import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Environment variables (keep them private in .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const oddsApiKey = process.env.ODDS_API_KEY!; // your The Odds API key

const supabase = createClient(supabaseUrl, supabaseKey);

// -------------------------------------------------------------
// MAIN UPDATE FUNCTION
// -------------------------------------------------------------
export async function GET() {
  try {
    console.log("🔄 Updating NFL player props...");

    // ✅ 1. Pull data from The Odds API
    const oddsUrl = `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?regions=us&markets=player_pass_yds,player_rush_yds,player_reception_yds&oddsFormat=american&apiKey=${oddsApiKey}`;

    const res = await fetch(oddsUrl);
    const data = await res.json();

    // Defensive check — The Odds API can return message/error JSON
    if (!Array.isArray(data)) {
      console.error("❌ Unexpected response format from The Odds API", data);
      return NextResponse.json({
        success: false,
        error: "Unexpected response format from The Odds API",
        sample: data,
      });
    }

    // ✅ 2. Normalize for Supabase insert
    const rows = data
      .flatMap((game: any) =>
        (game.bookmakers || []).flatMap((book: any) =>
          (book.markets || []).flatMap((market: any) =>
            (market.outcomes || []).map((outcome: any) => ({
              commence_time: game.commence_time,
              bookmaker: book.key,
              last_update: book.last_update,
              home_team: game.home_team,
              away_team: game.away_team,
              market: market.key,
              label: outcome.name, // Over/Under
              description: outcome.description || outcome.player_name || "",
              price: Number(outcome.price) || null,
              line: Number(outcome.point) || null,
            }))
          )
        )
      )
      .filter((r: any) => r.description && r.line !== null);

    if (rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No valid player prop data found.",
      });
    }

    // ✅ 3. Insert or upsert into Supabase
    const { error: insertError } = await supabase
      .from("nfl_player_props")
      .upsert(rows, { ignoreDuplicates: false });

    if (insertError) throw insertError;

    console.log(`✅ Inserted or updated ${rows.length} player props.`);

    // ✅ 4. Call the refresh_latest_props() function
    const refreshRes = await fetch(
      `${supabaseUrl}/rest/v1/rpc/refresh_latest_props`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!refreshRes.ok) {
      console.error("⚠️ Refresh RPC failed:", await refreshRes.text());
    } else {
      console.log("✅ Refreshed nfl_player_props_latest successfully.");
    }

    // ✅ 5. Return success
    return NextResponse.json({
      success: true,
      inserted: rows.length,
    });
  } catch (err: any) {
    console.error("❌ Error in update-nfl:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}










