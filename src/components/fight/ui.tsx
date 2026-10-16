import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const DISPLAY = { fontFamily: `"Bungee", "Impact", sans-serif` } as const;

export function ArcadeButton({
  children,
  className,
  tone = "primary",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "ghost" | "danger"; children: ReactNode }) {
  return (
    <button
      {...rest}
      className={cn(
        "group relative select-none rounded-md px-6 py-3 text-base tracking-wide transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60 active:translate-y-0.5",
        "disabled:cursor-not-allowed disabled:opacity-40",
        tone === "primary" &&
          "bg-gradient-to-b from-amber-300 to-orange-500 text-zinc-950 shadow-[0_4px_0_#9a3412,0_10px_30px_-8px_rgba(251,146,60,0.7)] hover:brightness-110",
        tone === "ghost" &&
          "border border-white/20 bg-white/5 text-white shadow-[0_4px_0_rgba(0,0,0,0.5)] backdrop-blur hover:bg-white/10",
        tone === "danger" &&
          "bg-gradient-to-b from-rose-400 to-red-600 text-white shadow-[0_4px_0_#7f1d1d] hover:brightness-110",
        className,
      )}
      style={{ ...DISPLAY, ...rest.style }}
    >
      {children}
    </button>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[1.6rem] items-center justify-center rounded border border-white/25 bg-white/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white shadow-[0_2px_0_rgba(0,0,0,0.5)]">
      {children}
    </kbd>
  );
}

export function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-white/70">
      <span className="w-16 shrink-0">{label}</span>
      <div className="flex flex-1 gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className="h-2 flex-1 -skew-x-12 rounded-[1px]"
            style={{ background: i < value ? color : "rgba(255,255,255,0.12)" }}
          />
        ))}
      </div>
    </div>
  );
}
