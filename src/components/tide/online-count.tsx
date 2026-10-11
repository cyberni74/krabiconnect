import { useEffect, useState } from "react";
import { useTT } from "@/lib/tide/i18n";

const HEARTBEAT_MS = 30_000;

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

/** Tiny "visitors online" line. Hidden until the server answers with a number. */
export function OnlineCount() {
  const { t } = useTT();
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    const id = tabId();
    let stopped = false;
    const ping = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch("/api/presence", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = (await res.json()) as { online?: number | null };
        if (!stopped) setOnline(typeof data.online === "number" ? data.online : null);
      } catch {
        if (!stopped) setOnline(null);
      }
    };
    void ping();
    const timer = window.setInterval(ping, HEARTBEAT_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void ping();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (online == null) return null;
  return (
    <div className="tide-label flex h-4 items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-white/45">
      <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
      <span>
        {t("online")}: <span className="tide-digits">{online}</span>
      </span>
    </div>
  );
}
