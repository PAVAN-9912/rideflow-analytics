import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; up: boolean };
}

export function KpiCard({ label, value, icon: Icon, trend }: Props) {
  return (
    <div className="rounded-xl p-4 bg-white border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-accentsoft">
          <Icon size={16} className="text-accent" strokeWidth={2} />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              trend.up ? "bg-tealsoft text-teal" : "bg-[#FBEAEA] text-rose"
            }`}
          >
            {trend.up ? <ArrowUpRight size={12} strokeWidth={2.5} /> : <ArrowDownRight size={12} strokeWidth={2.5} />}
            {trend.value}
          </span>
        )}
      </div>
      <div className="font-mono text-2xl font-semibold text-ink tracking-tight">{value}</div>
      <div className="text-xs mt-1 text-sub">{label}</div>
    </div>
  );
}
