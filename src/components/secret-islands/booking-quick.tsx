import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AddOn } from "./booking-data";
import { itemAmount, quickAdds, toggleQuick } from "./booking-model";
import type { StepProps } from "./booking-steps";
import { formatTHB, useTx } from "./store";

function Switch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors",
        on ? "bg-si-cyan" : "bg-white/15",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cn("size-5 rounded-full bg-white shadow", on ? "ml-auto" : "")}
      />
    </span>
  );
}

/** Price suffix "+฿500 p. P." / "+฿2,200". */
function usePriceTag() {
  const { t } = useTx();
  return (item: AddOn) =>
    `+${formatTHB(item.price)}${item.per === "person" ? ` ${t({ de: "p. P.", en: "p.p." })}` : ""}`;
}

/** Sidebar / step version: full-width switch rows. */
export function QuickAddPanel({ draft, patch, className }: Pick<StepProps, "draft" | "patch"> & { className?: string }) {
  const { t } = useTx();
  const tag = usePriceTag();
  return (
    <div className={cn("space-y-2", className)}>
      {quickAdds(draft).map((q) => {
        const on = draft[q.list].includes(q.item.id);
        return (
          <motion.button
            layout
            key={q.item.id}
            type="button"
            role="switch"
            aria-checked={on}
            onClick={() => toggleQuick(patch, q)}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
              on
                ? "border-si-cyan/60 bg-si-cyan/15 shadow-[0_8px_30px_-14px_rgb(6_182_212/1)]"
                : q.primary
                  ? "si-glow-border border-transparent bg-white/[0.06] hover:bg-white/[0.09]"
                  : "border-white/10 bg-white/[0.04] hover:border-white/25",
            )}
          >
            <span aria-hidden className="text-2xl">
              {q.item.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-snug text-white">{t(q.item.label)}</span>
              <span className="block text-xs text-slate-400">
                {tag(q.item)}
                {on && q.item.per === "person" ? ` · = ${formatTHB(itemAmount(q.item, draft.guests, draft.kids))}` : ""}
              </span>
            </span>
            <Switch on={on} />
          </motion.button>
        );
      })}
    </div>
  );
}

/** Mobile bottom-bar version: compact horizontally scrolling chips. */
export function QuickAddChips({ draft, patch }: Pick<StepProps, "draft" | "patch">) {
  const { t } = useTx();
  const tag = usePriceTag();
  return (
    <div className="hide-scroll -mx-4 mb-2.5 flex gap-2 overflow-x-auto px-4">
      {quickAdds(draft).map((q) => {
        const on = draft[q.list].includes(q.item.id);
        return (
          <button
            key={q.item.id}
            type="button"
            role="switch"
            aria-checked={on}
            onClick={() => toggleQuick(patch, q)}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border py-1 pl-3 pr-1.5 text-[13px] font-semibold transition",
              on ? "border-si-cyan/70 bg-si-cyan/20 text-white" : "border-white/15 bg-white/[0.06] text-slate-200",
            )}
          >
            <span aria-hidden>{q.item.emoji}</span>
            <span className="whitespace-nowrap">{t(q.item.label)}</span>
            <span className={cn("whitespace-nowrap text-xs", on ? "text-cyan-200" : "text-slate-400")}>
              {on && q.item.per === "person" ? formatTHB(itemAmount(q.item, draft.guests, draft.kids)) : tag(q.item)}
            </span>
            <Switch on={on} />
          </button>
        );
      })}
    </div>
  );
}
