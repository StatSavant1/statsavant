import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 1️⃣ Get list of NFL events
    const eventsResp = await fetch(
      `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/events/?apiKey=${process.env.NEXT_PUBLIC_ODDS_API_KEY}`
    );
    const events = await eventsResp.json();

    if (!Array.isArray(events)) {
      throw new Error(`Unexpected events format: ${JSON.stringify(events)}`);
    }

    let allProps: any[] = [];

    // 2️⃣ Loop through each event to get player prop odds
    for (const game of events.slice(0, 5)) {
      const oddsUrl = `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/events/${game.id}/odds/?apiKey=${process.env.NEXT_PUBLIC_ODDS_API_KEY}&regions=us&markets=player_pass_yds,player_rush_yds,player_reception_yds&oddsFormat=american`;

      const resp = await fetch(oddsUrl);
      const oddsData = await resp.json();

      if (oddsData?.bookmakers) {
        const mapped = oddsData.bookmakers.flatMap((book: any) =>
          (book.markets || []).flatMap((market: any) =>
            (market.outcomes || []).map((o: any) => ({
              player_name: o.name,
              team: oddsData.home_team,
              opponent: oddsData.away_team,
              stat_type: market.key,
              line: o.point ?? null,
              over_odds: o.price ?? null,
              source: book.title,
              updated_at: new Date().toISOString(),
            }))
          )
        );

        allProps.push(...mapped);
      }
    }

    // 3️⃣ Deduplicate before upsert
    if (allProps.length > 0) {
      const uniqueProps = Array.from(
        new Map(
          allProps.map((p) => [
            `${p.player_name}-${p.stat_type}-${p.opponent}`,
            p,
          ])
        ).values()
      );

      const { error } = await supabase
        .from("nfl_player_props")
        .upsert(uniqueProps, { onConflict: "player_name,stat_type,opponent" });

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      inserted: allProps.length,
    });
  } catch (err: any) {
    console.error("Error in update-nfl:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}



