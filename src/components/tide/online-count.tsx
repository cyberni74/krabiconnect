import { useEffect, useState } from "react";
import { useTT } from "@/lib/tide/i18n";

/** Own presence is announced every 30 s; the shown count is refreshed more often. */
const HEARTBEAT_MS = 30_000;
const REFRESH_MS = 10_000;

function tabId(): string {
  try {
    let id = sessionStorage.getItem("tide-presence-id");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("tide-presence-id", id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/** Tiny live visitor line. Hidden until the server answers with a number. */
export function OnlineCount() {
  const { t } = useTT();
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    const id = tabId();
    let stopped = false;
    const apply = async (res: Response) => {
      const data = (await res.json()) as { online?: number | null };
      if (!stopped) setOnline(typeof data.online === "number" ? data.online : null);
    };
    const announce = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        await apply(
          await fetch("/api/presence", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id }),
          }),
        );
      } catch {
        if (!stopped) setOnline(null);
      }
    };
    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        await apply(await fetch("/api/presence", { cache: "no-store" }));
      } catch {
        /* keep the last number */
      }
    };
    void announce();
    const beat = window.setInterval(announce, HEARTBEAT_MS);
    const poll = window.setInterval(refresh, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void announce();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      window.clearInterval(beat);
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (online == null) return null;
  const label = online === 1 ? t("liveOne") : t("liveMany").replace("{n}", String(online));
  return (
    <div className="tide-label flex h-4 items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-white/55">
      <span className="relative flex size-1.5" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
      </span>
      <span className="tide-digits">{label}</span>
    </div>
  );
}
