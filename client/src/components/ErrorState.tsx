import { AlertTriangle, RotateCw } from "lucide-react";

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 gap-3">
      <div className="flex items-center justify-center rounded-full bg-[#FBEAEA] w-12 h-12">
        <AlertTriangle size={20} className="text-rose" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink">Couldn't load this data</p>
        <p className="text-xs text-sub mt-1 max-w-xs">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 bg-accentsoft text-accent"
      >
        <RotateCw size={12} /> Retry
      </button>
    </div>
  );
}
