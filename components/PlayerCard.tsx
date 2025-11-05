"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  LabelList,
  Cell,
} from "recharts";

type Player = {
  player: string;
  line: number | null;
  avg_l_5: number | null;
  cover_pct_l5: number | null;
  g1: number | null;
  g2: number | null;
  g3: number | null;
  g4: number | null;
  g5: number | null;
  commence_time?: string;
};

export function PlayerCard({ player }: { player: Player }) {
  const chartData = [
    { name: "G1", yards: player.g1 },
    { name: "G2", yards: player.g2 },
    { name: "G3", yards: player.g3 },
    { name: "G4", yards: player.g4 },
    { name: "G5", yards: player.g5 },
  ].filter((d) => d.yards !== null);

  const getBarColor = (entry: { yards: number }) => {
    if (!player.line) return "#22c55e"; // default green if no line
    return entry.yards >= player.line ? "#22c55e" : "#ef4444"; // green for over, red for under
  };

  return (
    <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 shadow-lg hover:shadow-[0_0_15px_#00FF7F30] transition-shadow duration-300">
      {/* Player Name */}
      <h2 className="text-lg font-bold text-green-400 mb-2">
        {player.player || "—"}
      </h2>

      {/* Meta info */}
      <div className="text-sm mb-3 space-y-1">
        <p>
          <span className="text-gray-400">Current Line:</span>{" "}
          {player.line ? (
            <span className="text-red-400 font-semibold">{player.line}</span>
          ) : (
            <span className="text-gray-500">–</span>
          )}
        </p>
        <p>
          <span className="text-gray-400">Avg (L5):</span>{" "}
          <span className="text-blue-400">
            {player.avg_l_5 != null ? player.avg_l_5.toFixed(2) : "–"}
          </span>
        </p>
        <p>
          <span className="text-gray-400">Cover % (L5):</span>{" "}
          <span className="text-green-400">
            {player.cover_pct_l5 != null
              ? `${player.cover_pct_l5.toFixed(1)}%`
              : "–"}
          </span>
        </p>
      </div>

      {/* Chart */}
      <div className="flex justify-center">
        <BarChart
          width={260}
          height={200}
          data={chartData}
          margin={{ top: 40, right: 10, left: 0, bottom: 10 }} // prevents cutoff
        >
          <XAxis dataKey="name" tick={{ fill: "#aaa", fontSize: 12 }} />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.06)" }}
            contentStyle={{
              background: "#111",
              border: "1px solid #333",
              borderRadius: "8px",
            }}
          />

          <Bar dataKey="yards" radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="yards"
              position="top"
              offset={10} // extra spacing for visibility
              style={{ fill: "#fff", fontSize: 12 }}
            />
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={getBarColor(entry as { yards: number })}
              />
            ))}
          </Bar>

          {/* Draw line *after* bars to appear on top */}
          {player.line && (
            <ReferenceLine
              y={player.line}
              stroke="red"
              strokeDasharray="4 4"
              label={{
                value: `Line: ${player.line}`,
                position: "top",
                fill: "red",
                fontSize: 12,
              }}
            />
          )}
        </BarChart>
      </div>
    </div>
  );
}


