"use client";

import { Loader2 } from "lucide-react";

interface ConversionProgressProps {
  label: string;
  /** 0-1 for determinate progress, or null for an indeterminate pulse. */
  progress: number | null;
}

export function ConversionProgress({ label, progress }: ConversionProgressProps) {
  const percent = progress === null ? null : Math.round(progress * 100);

  return (
    <div
      className="w-full space-y-3 rounded-2xl border bg-card p-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        {label}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={
            percent === null
              ? { width: "40%", animation: "pulse 1.5s ease-in-out infinite" }
              : { width: `${percent}%` }
          }
        />
      </div>
      {percent !== null && <p className="text-xs text-muted-foreground">{percent}%</p>}
    </div>
  );
}
