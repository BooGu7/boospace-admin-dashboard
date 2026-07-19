"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface AudienceChartsProps {
  data: { range: string; value: number }[];
}

export function AudienceCharts({ data }: AudienceChartsProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="range" tickLine={false} axisLine={false} className="text-xs font-semibold text-slate-600" />
        <YAxis tickLine={false} axisLine={false} className="text-xs text-slate-500" />
        <Tooltip cursor={{ fill: "transparent" }} />
        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
