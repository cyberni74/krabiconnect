import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { LanguagePill } from "@/components/layout/language-pill";
import { loc, useT } from "@/lib/i18n";
import { getMessages, sendMessage, setBookingStatus } from "@/lib/server/community";
import { cn, initials } from "@/lib/utils";

export const Route = createFileRoute("/chats/$id")({ component: ThreadPage });

function ThreadPage() {
  const { id } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const me = useCurrentUser();
  const { lang, t } = useT();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [showOrig, setShowOrig] = useState<Record<string, boolean>>({});
  const bottom = useRef<HTMLDivElement>(null);

  const q = useQuery({
    queryKey: ["thread", id],
    queryFn: () => getMessages({ data: id }),
    enabled: Boolean(user),
    refetchInterval: 8000,
  });

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [q.data?.messages.length]);

  const send = useMutation({
    mutationFn: () => sendMessage({ data: { conversationId: id, text } }),
    onSuccess: () => {
      setText("");
      void qc.invalidateQueries({ queryKey: ["thread", id] });
      void qc.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const book = useMutation({
    mutationFn: (input: { id: string; status: "confirmed" | "cancelled" | "completed" }) =>
      setBookingStatus({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["thread", id] }),
  });

  if (isPending) return <div className="h-40 animate-pulse bg-surface-2" />;
  if (!user) return <RedirectToSignIn />;

  const conv = q.data?.conversation;
  const messages = q.data?.messages ?? [];
  const bookings = q.data?.bookings ?? [];

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col bg-bg">
      <header className="flex items-center gap-3 bg-surface px-3 py-3 shadow-card">
        <Link to="/chats" className="grid size-10 place-items-center rounded-full hover:bg-surface-2">
          <ArrowLeft className="size-5" />
        </Link>
        <span className="grid size-10 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
          {conv?.otherAvatar ? (
            <img src={conv.otherAvatar} alt="" className="size-10 rounded-full object-cover" />
          ) : (
            initials(conv?.otherName ?? "N")
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{conv?.otherName ?? t("chat")}</p>
          <p className="truncate text-xs text-muted">
            {conv ? loc(lang, conv.listingTitleTh, conv.listingTitleEn) : ""}
          </p>
        </div>
        <LanguagePill />
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {bookings.map((b) => (
          <div key={b.id} className="rounded-2xl bg-primary-soft px-3 py-3 text-sm">
            <p className="font-medium">
              {t("dates")}: {b.startDate} → {b.endDate}
            </p>
            <p className="text-muted">{b.status}</p>
            {b.providerId === me?.id && b.status === "pending" ? (
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => book.mutate({ id: b.id, status: "confirmed" })}>
                  {t("bookingConfirm")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => book.mutate({ id: b.id, status: "cancelled" })}
                >
                  {t("bookingDecline")}
                </Button>
              </div>
            ) : null}
          </div>
        ))}
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">{t("noMessages")}</p>
        ) : null}
        {messages.map((m) => {
          const mine = m.senderId === me?.id;
          const orig = showOrig[m.id];
          const display = orig
            ? m.textOriginal
            : lang === m.originalLanguage
              ? m.textOriginal
              : m.textTranslated || m.textOriginal;
          const translated = Boolean(
            !mine && m.originalLanguage !== lang && m.textTranslated && m.textTranslated !== m.textOriginal,
          );
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-xs px-3.5 py-2.5 text-sm leading-relaxed",
                  mine
                    ? "rounded-2xl rounded-br-md bg-primary text-primary-fg"
                    : "rounded-2xl rounded-bl-md bg-surface-2 text-fg",
                )}
              >
                <p>{display}</p>
                {translated ? (
                  <button
                    type="button"
                    className="mt-1 text-2xs text-muted"
                    onClick={() => setShowOrig((s) => ({ ...s, [m.id]: !s[m.id] }))}
                  >
                    {orig
                      ? t("showTranslation")
                      : m.originalLanguage === "th"
                        ? `${t("translatedFromTh")}. ${t("showOriginal")}`
                        : `${t("translatedFromEn")}. ${t("showOriginal")}`}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>
      <form
        className="flex gap-2 bg-surface px-3 py-3 shadow-card"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) send.mutate();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("messagePlaceholder")}
          className="h-11 flex-1 rounded-full bg-surface-2 px-4 text-sm placeholder:text-faint focus-visible:outline-2 focus-visible:outline-primary"
        />
        <Button type="submit" size="icon" className="rounded-full" disabled={send.isPending || !text.trim()} aria-label={t("send")}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
