import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loc, useT } from "@/lib/i18n";
import { listConversations } from "@/lib/server/community";
import { initials } from "@/lib/utils";

export const Route = createFileRoute("/chats")({ component: ChatsPage });

function ChatsPage() {
  const { user, isPending } = useCurrentUserState();
  const { lang, t } = useT();
  const q = useQuery({
    queryKey: ["chats"],
    queryFn: () => listConversations(),
    enabled: Boolean(user),
  });
  if (isPending) return <div className="h-40 animate-pulse bg-surface-2" />;
  if (!user) return <RedirectToSignIn />;

  const rows = q.data ?? [];
  return (
    <main className="px-4 py-2">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">{t("chats")}</h1>
      {rows.length === 0 ? (
        <div className="rounded-2xl bg-surface px-4 py-12 text-center shadow-card">
          <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
            <MessageCircle className="size-5" />
          </span>
          <p className="text-sm text-muted">{t("emptyChats")}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((c) => (
            <li key={c.id}>
              <Link
                to="/chats/$id"
                params={{ id: c.id }}
                className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card"
              >
                <span className="relative grid size-12 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                  {c.otherAvatar ? (
                    <img src={c.otherAvatar} alt="" className="size-12 rounded-full object-cover" />
                  ) : (
                    initials(c.otherName)
                  )}
                  {c.unread ? (
                    <span className="absolute right-0 top-0 size-2.5 rounded-full bg-danger ring-2 ring-surface" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{c.otherName}</span>
                    <span className="text-2xs text-faint">
                      {c.lastAt ? new Date(c.lastAt).toLocaleDateString() : ""}
                    </span>
                  </span>
                  <span className="block truncate text-sm text-muted">
                    {loc(lang, c.listingTitleTh, c.listingTitleEn)}
                  </span>
                  {c.lastText ? (
                    <span className="block truncate text-xs text-faint">{c.lastText}</span>
                  ) : null}
                </span>
                {c.listingImage ? (
                  <img src={c.listingImage} alt="" className="size-12 rounded-xl object-cover" />
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
