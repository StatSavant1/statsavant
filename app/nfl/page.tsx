"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NFLPage() {
  const [propsData, setPropsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("nfl_player_props")
        .select("player_name, team, stat_type, line, over_odds, under_odds")
        .limit(50);

      if (error) {
        console.error("Error loading data:", error);
      } else {
        setPropsData(data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <p className="text-gray-300 text-center mt-8">Loading NFL player props...</p>;

  return (
    <div className="p-8 text-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-green-400">NFL Player Props</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {propsData.map((prop, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-green-500/20 transition">
            <h2 className="text-lg font-semibold text-white">{prop.player_name}</h2>
            <p className="text-gray-400">{prop.team}</p>
            <p className="text-sm text-gray-300 mt-2">{prop.stat_type}: {prop.line}</p>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-green-400">O: {prop.over_odds}</span>
              <span className="text-red-400">U: {prop.under_odds}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

