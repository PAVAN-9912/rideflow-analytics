import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
  color?: string;
  formatX?: (v: unknown) => string;
}

/** Generic histogram/bar chart used for fare, duration, passenger, and rating distributions. */
export function DistributionChart({ data, xKey, yKey, color = "#3160EE", formatX }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="#E6E8F0" vertical={false} />
        <XAxis
          dataKey={xKey}
          tickFormatter={formatX}
          tick={{ fontSize: 10, fill: "#9BA1B4" }}
          axisLine={{ stroke: "#E6E8F0" }}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 10, fill: "#9BA1B4" }} axisLine={false} tickLine={false} width={30} />
        <Tooltip
          contentStyle={{ background: "#0B1220", border: "1px solid #182035", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#9BA1B4" }}
          itemStyle={{ color: "#fff" }}
        />
        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
