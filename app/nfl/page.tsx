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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("nfl_player_props")
        .select("player_name, team, position, stat_type, line, over_odds, under_odds, recent_trend, photo_url")
        .order("player_name", { ascending: true })
        .limit(100);

      if (error) console.error("Error loading data:", error);
      else setPropsData(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredProps = propsData.filter((prop) =>
    prop.player_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return <p className="text-gray-300 text-center mt-8">Loading NFL player props...</p>;

  return (
    <div className="p-8 text-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-green-400 text-center">NFL Player Props</h1>

      {/* Search Filter */}
      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search players..."
          className="p-2 rounded-md bg-gray-800 border border-gray-700 text-white w-64 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProps.map((prop, index) => (
          <div key={index} className="bg-gray-900 p-5 rounded-xl shadow-lg hover:shadow-green-400/10 transition">
            {prop.photo_url && (
              <img
                src={prop.photo_url}
                alt={prop.player_name}
                className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-green-400 object-cover"
              />
            )}
            <h2 className="text-lg font-bold text-center text-white">{prop.player_name}</h2>
            <p className="text-center text-gray-400 text-sm">{prop.team} • {prop.position}</p>

            <div className="mt-3 text-sm text-gray-300 text-center">
              <p>{prop.stat_type}: <span className="text-white font-semibold">{prop.line}</span></p>
              <p className="mt-1">
                <span className="text-green-400">O {prop.over_odds}</span> / 
                <span className="text-red-400"> U {prop.under_odds}</span>
              </p>
            </div>

            {prop.recent_trend && (
              <p className="mt-3 text-xs text-center text-yellow-400 italic">
                Trend: {prop.recent_trend}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


