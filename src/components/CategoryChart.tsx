"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { CategoryStat } from "@/lib/getDashboardStats";

const COLORS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#eab308", // yellow-500
  "#3b82f6", // blue-500
  "#a855f7", // purple-500
  "#ec4899", // pink-500
  "#64748b", // slate-500
];

export default function CategoryChart({ data }: { data: CategoryStat[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground border-2 border-dashed border-border/40 rounded-xl">
        No category report data available yet.
      </div>
    );
  }

  return (
    <div className="w-full h-[320px] pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={140}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "12px",
            }}
            cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
