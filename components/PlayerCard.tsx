"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Cell,
} from "recharts";

type PlayerCardProps = {
  player: string;
  market: string;
  line: number | null;
  lastGames: number[];
  avg: number | null;
  windowLabel: string; // "L5" | "L10"
};

export default function PlayerCard({
  player,
  market,
  line,
  lastGames,
  avg,
  windowLabel,
}: PlayerCardProps) {
  if (!Array.isArray(lastGames) || lastGames.length === 0) return null;

  const data = lastGames.map((v, i) => ({
    name: `G${i + 1}`,
    value: v,
    isOver: line !== null && v >= line,
  }));

  const avgColor =
    avg !== null && line !== null
      ? avg >= line
        ? "text-green-400"
        : "text-red-400"
      : "text-slate-300";

  return (
    <div className="rounded-2xl p-6 border border-slate-700/40 bg-gradient-to-br from-[#0b1220] to-[#0e1627] shadow-xl">
      {/* PLAYER */}
      <h2 className="text-2xl font-bold text-green-400 mb-3">
        {player}
      </h2>

      {/* MARKET */}
      <p className="text-slate-200 text-lg mb-1">
        <span className="font-semibold">Market:</span>{" "}
        {market.replaceAll("_", " ")}
      </p>

      {/* LINE */}
      <p className="text-slate-200 text-lg mb-1">
        <span className="font-semibold">Line:</span>{" "}
        <span className="text-white font-bold">
          {line ?? "-"}
        </span>
      </p>

      {/* AVG */}
      <p className="text-lg font-semibold mb-4">
        <span className="text-slate-200">
          Avg ({windowLabel}):
        </span>{" "}
        <span className={avgColor}>
          {avg ?? "-"}
        </span>
      </p>

      {/* CHART */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 10, left: -5, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />

            <XAxis
  dataKey="name"
  interval={0} // 🔥 FORCE ALL LABELS
  tick={{ fill: "#CBD5E1", fontSize: 14 }}
  tickLine={false}
/>

            <YAxis
              tick={{ fill: "#CBD5E1", fontSize: 14 }}
              tickLine={false}
              axisLine={false}
            />

            {/* PROP LINE */}
            {line !== null && (
              <ReferenceLine
                y={line}
                stroke="#ef4444"
                strokeDasharray="6 6"
              />
            )}

            <Bar dataKey="value" barSize={28} radius={[6, 6, 0, 0]}>
              <LabelList
                dataKey="value"
                position="top"
                fill="#E5E7EB"
                fontSize={13}
              />
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isOver ? "#22c55e" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}






























































