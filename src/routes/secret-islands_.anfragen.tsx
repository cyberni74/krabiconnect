import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Phone, RefreshCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AuroraBackground, btn } from "@/components/secret-islands/fx";
import { WhatsAppIcon } from "@/components/secret-islands/ui";
import { listBookingRequests, updateBookingRequest, type BookingStatus } from "@/lib/server/booking-requests";

/** Admin inbox for booking requests from the Secret Islands booking wizard (admins only, not indexed). */
export const Route = createFileRoute("/secret-islands_/anfragen")({
  head: () => ({ meta: [{ title: "Anfragen – Krabi Secret Islands" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: BookingInbox,
});

const STATUS: { id: BookingStatus; label: string; cls: string }[] = [
  { id: "new", label: "Neu", cls: "bg-si-cyan text-si-navy" },
  { id: "contacted", label: "Kontaktiert", cls: "bg-sky-500/80 text-white" },
  { id: "confirmed", label: "Bestätigt", cls: "bg-emerald-500 text-white" },
  { id: "declined", label: "Abgelehnt", cls: "bg-rose-500/80 text-white" },
  { id: "done", label: "Erledigt", cls: "bg-slate-500 text-white" },
];

type Row = Awaited<ReturnType<typeof listBookingRequests>>[number];

function BookingInbox() {
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const q = useQuery({ queryKey: ["booking-requests"], queryFn: () => listBookingRequests(), retry: false, refetchInterval: 60_000 });
  const rows = (q.data ?? []).filter((r) => filter === "all" || r.status === filter);
  const unauthorized = q.isError;

  return (
    <div className="relative isolate min-h-dvh px-4 pb-16 pt-8 font-jakarta text-white sm:px-6">
      <AuroraBackground />
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Krabi Secret Islands</p>
            <h1 className="text-3xl font-extrabold">Buchungsanfragen</h1>
          </div>
          <button type="button" onClick={() => void q.refetch()} className={cn(btn.glass, "min-h-11 px-4 text-sm")}>
            <RefreshCw className={cn("size-4", q.isFetching && "animate-spin")} /> Aktualisieren
          </button>
        </div>

        {unauthorized ? (
          <div className="si-glass mt-8 rounded-3xl p-6">
            <p className="font-bold">Nur für Admins.</p>
            <p className="mt-1 text-sm text-slate-300">Bitte mit dem Admin-Konto anmelden.</p>
            <Link to="/login" search={{ next: "/secret-islands/anfragen" }} className={cn(btn.primary, "mt-4")}>
              Anmelden
            </Link>
          </div>
        ) : (
          <>
            <div className="hide-scroll -mx-4 mt-6 flex gap-2 overflow-x-auto px-4">
              {[{ id: "all" as const, label: "Alle" }, ...STATUS].map((s) => {
                const n = s.id === "all" ? (q.data?.length ?? 0) : (q.data ?? []).filter((r) => r.status === s.id).length;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFilter(s.id)}
                    className={cn(
                      "min-h-11 shrink-0 rounded-full px-4 text-sm font-bold",
                      filter === s.id ? "bg-white text-si-navy" : "si-glass text-slate-200",
                    )}
                  >
                    {s.label} ({n})
                  </button>
                );
              })}
            </div>
            {q.isLoading ? <p className="mt-8 text-slate-300">Lade …</p> : null}
            {!q.isLoading && rows.length === 0 ? <p className="mt-8 text-slate-300">Keine Anfragen.</p> : null}
            <ul className="mt-6 space-y-4">
              {rows.map((r) => (
                <RequestCard key={r.id} row={r} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function RequestCard({ row: r }: { row: Row }) {
  const qc = useQueryClient();
  const [note, setNote] = useState(r.admin_note ?? "");
  const [open, setOpen] = useState(false);
  const save = useMutation({
    mutationFn: (status: BookingStatus) => updateBookingRequest({ data: { id: r.id, status, note: note.trim() || null } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["booking-requests"] }),
  });
  const st = STATUS.find((s) => s.id === r.status) ?? STATUS[0];
  const phoneDigits = r.phone?.replace(/\D/g, "") ?? "";
  const created = new Date(r.created_at).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });

  return (
    <li className="si-glass rounded-3xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-bold text-cyan-200">{r.ref}</p>
          <p className="mt-1 text-lg font-extrabold leading-snug">{r.tour_title}</p>
          <p className="mt-1 text-sm text-slate-300">
            {r.tour_date ?? "–"} {r.slot ? `· ${r.slot}` : ""} · {r.guests} Pers.{r.kids ? ` (${r.kids} Kinder)` : ""} ·{" "}
            <b className="text-white">฿{r.total_thb.toLocaleString("de-DE")}</b>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Eingang {created} · Sprache {r.lang.toUpperCase()} · via {r.channel === "wa" ? "WhatsApp" : "E-Mail"}
            {r.occasion ? ` · Anlass: ${r.occasion}` : ""}
          </p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-bold", st.cls)}>{st.label}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <span className="si-glass rounded-full px-3 py-1.5 font-semibold">{r.name}</span>
        {phoneDigits ? (
          <>
            <a href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(`Hallo ${r.name}, danke für Ihre Anfrage ${r.ref} bei Krabi Secret Islands!`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-si-wa px-3 font-bold text-white">
              <WhatsAppIcon className="size-4" /> Antworten
            </a>
            <a href={`tel:${r.phone}`} className="si-glass inline-flex min-h-9 items-center gap-1.5 rounded-full px-3">
              <Phone className="size-4" /> {r.phone}
            </a>
          </>
        ) : null}
        {r.email ? (
          <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Ihre Anfrage ${r.ref} – Krabi Secret Islands`)}`} className="si-glass inline-flex min-h-9 items-center gap-1.5 rounded-full px-3">
            <Mail className="size-4" /> {r.email}
          </a>
        ) : null}
        {r.hotel ? <span className="si-glass rounded-full px-3 py-1.5 text-slate-300">Hotel: {r.hotel}</span> : null}
      </div>
      {r.wishes ? <p className="mt-3 rounded-2xl bg-white/5 p-3 text-sm text-slate-200">„{r.wishes}“</p> : null}

      <button type="button" onClick={() => setOpen((o) => !o)} className="mt-3 text-sm font-semibold text-cyan-300">
        {open ? "Details ausblenden" : "Komplette Anfrage anzeigen"}
      </button>
      {open ? <pre className="mt-2 whitespace-pre-wrap rounded-2xl bg-black/30 p-3 text-xs text-slate-300">{r.message}</pre> : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Interne Notiz (nur für euch)"
          className="min-h-11 rounded-2xl bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-si-cyan"
        />
        <div className="flex flex-wrap gap-1.5">
          {STATUS.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={save.isPending}
              onClick={() => save.mutate(s.id)}
              className={cn("min-h-11 rounded-xl px-3 text-xs font-bold", r.status === s.id ? s.cls : "si-glass text-slate-200")}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </li>
  );
}
