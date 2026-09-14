import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  tone = "muted",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "muted" | "primary" | "success" | "warn" }) {
  const tones = {
    muted: "bg-surface-2 text-muted",
    primary: "bg-primary-soft text-primary",
    success: "bg-success/12 text-success",
    warn: "bg-bg-warm text-fg",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
