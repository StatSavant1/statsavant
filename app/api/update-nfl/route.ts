import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    console.log("Running NFL auto-update...");

    // 1️⃣ Pull data from QB, RB, and WR tables (synced from Google Sheets)
    const { data: qbData, error: qbError } = await supabase
      .from("nfl_qb_player_props")
      .select("*");
    const { data: rbData, error: rbError } = await supabase
      .from("nfl_rb_player_props")
      .select("*");
    const { data: wrData, error: wrError } = await supabase
      .from("nfl_wr_player_props")
      .select("*");

    if (qbError || rbError || wrError) {
      throw new Error(
        `Supabase read error: ${
          qbError?.message || rbError?.message || wrError?.message
        }`
      );
    }

    // 2️⃣ Combine all datasets
    const combined = [
      ...(qbData || []).map((p) => ({ ...p, position: "QB" })),
      ...(rbData || []).map((p) => ({ ...p, position: "RB" })),
      ...(wrData || []).map((p) => ({ ...p, position: "WR" })),
    ];

    // 3️⃣ Filter invalid rows
    const filtered = combined.filter(
      (p) => p.description && p.market && p.point !== null
    );

    // 4️⃣ Upsert into master table
    const { error: upsertError } = await supabase
      .from("nfl_player_props")
      .upsert(filtered, { onConflict: "description,market,label" });

    if (upsertError) throw upsertError;

    console.log(`✅ NFL update complete — ${filtered.length} rows.`);
    return NextResponse.json({
      success: true,
      message: "NFL player props updated successfully",
      total: filtered.length,
    });
  } catch (err: any) {
    console.error("Error in update-nfl route:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Unexpected server error",
    });
  }
}









