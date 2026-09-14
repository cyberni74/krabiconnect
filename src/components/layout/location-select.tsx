import { ChevronDown, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DISTRICTS, districtName } from "@/lib/constants";
import { useAreaStore } from "@/lib/area";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LocationSelect() {
  const { lang, t } = useT();
  const district = useAreaStore((s) => s.district);
  const setDistrict = useAreaStore((s) => s.setDistrict);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const label = district ? districtName(district, lang) : t("allAreas");

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-52 items-center gap-1.5 rounded-full bg-surface py-1.5 pl-2.5 pr-2 shadow-card"
        aria-expanded={open}
      >
        <MapPin className="size-4 shrink-0 text-primary" />
        <span className="truncate text-sm font-medium">{label}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="absolute left-0 top-11 z-50 w-56 overflow-hidden rounded-2xl bg-surface py-1 shadow-float">
          <button
            type="button"
            className={cn(
              "flex w-full px-3 py-2.5 text-left text-sm",
              !district ? "bg-primary-soft font-medium text-primary" : "text-fg",
            )}
            onClick={() => {
              setDistrict("");
              setOpen(false);
            }}
          >
            {t("allAreas")}
          </button>
          {DISTRICTS.map((d) => (
            <button
              key={d.id}
              type="button"
              className={cn(
                "flex w-full px-3 py-2.5 text-left text-sm",
                district === d.id ? "bg-primary-soft font-medium text-primary" : "text-fg",
              )}
              onClick={() => {
                setDistrict(d.id);
                setOpen(false);
              }}
            >
              {districtName(d.id, lang)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
