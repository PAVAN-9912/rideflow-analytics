import { Inbox } from "lucide-react";

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 gap-2">
      <div className="flex items-center justify-center rounded-full bg-accentsoft w-12 h-12">
        <Inbox size={20} className="text-accent" />
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {hint && <p className="text-xs text-sub max-w-xs">{hint}</p>}
    </div>
  );
}
