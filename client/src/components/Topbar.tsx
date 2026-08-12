import { Bell, Search } from "lucide-react";

export function Topbar({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between px-6 h-16 shrink-0 bg-white border-b border-border">
      <span className="text-sm font-semibold text-ink">{title}</span>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 rounded-lg px-3 h-9 bg-paper border border-border w-[260px]">
          <Search size={14} className="text-faint" />
          <input
            placeholder="Search trips, drivers…"
            className="bg-transparent outline-none text-sm w-full text-ink placeholder:text-faint"
          />
        </div>
        <button className="relative flex items-center justify-center rounded-lg w-9 h-9 border border-border">
          <Bell size={16} className="text-sub" />
          <span className="absolute rounded-full w-1.5 h-1.5 bg-rose top-2 right-2.5" />
        </button>
        <div className="flex items-center justify-center rounded-full w-8 h-8 bg-accentsoft text-accent text-xs font-semibold">
          AD
        </div>
      </div>
    </header>
  );
}
