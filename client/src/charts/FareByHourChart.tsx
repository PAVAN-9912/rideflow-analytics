import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FareByHourPoint } from "../types";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-lg bg-navy text-white font-mono border border-navyedge">
      <div className="text-faint mb-0.5">{String(label).padStart(2, "0")}:00</div>
      <div className="font-semibold">${payload[0].value.toFixed(2)} avg fare</div>
    </div>
  );
}

export function FareByHourChart({ data }: { data: FareByHourPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="fareFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3160EE" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#3160EE" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#E6E8F0" vertical={false} />
        <XAxis
          dataKey="hour"
          tickFormatter={(h) => `${String(h).padStart(2, "0")}:00`}
          tick={{ fontSize: 10, fill: "#9BA1B4" }}
          interval={3}
          axisLine={{ stroke: "#E6E8F0" }}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 10, fill: "#9BA1B4" }} axisLine={false} tickLine={false} width={34} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="avgFare" stroke="#3160EE" strokeWidth={2} fill="url(#fareFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
