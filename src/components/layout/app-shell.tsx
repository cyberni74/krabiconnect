import { Link, useRouterState } from "@tanstack/react-router";
import {
  Compass,
  MessageCircle,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Logo } from "@/components/logo";
import { LanguagePill } from "@/components/layout/language-pill";
import { LocationSelect } from "@/components/layout/location-select";
import { initDeviceLanguage, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", key: "discover" as const, icon: Compass },
  { to: "/search", key: "search" as const, icon: Search },
  { to: "/create", key: "create" as const, icon: Plus, prominent: true },
  { to: "/chats", key: "chats" as const, icon: MessageCircle },
  { to: "/account", key: "account" as const, icon: UserRound },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { t, lang } = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    initDeviceLanguage();
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const hideNav = pathname === "/login" || pathname === "/admin";
  const hideTop =
    hideNav ||
    pathname.startsWith("/service/") ||
    pathname.startsWith("/item/") ||
    /^\/chats\/.+/.test(pathname);
  const isHome = pathname === "/";

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-bg">
      {!hideTop ? (
        <header className="sticky top-0 z-30 flex items-center gap-3 bg-bg/90 px-4 py-3 backdrop-blur-md">
          {isHome ? (
            <>
              <Link to="/" className="shrink-0" aria-label={t("appName")}>
                <Logo className="size-8" />
              </Link>
              <LocationSelect />
            </>
          ) : (
            <Link to="/" className="flex min-w-0 items-center gap-2">
              <Logo className="size-8" />
              <span className="truncate font-semibold tracking-tight">{t("appName")}</span>
            </Link>
          )}
          <div className="ml-auto">
            <LanguagePill />
          </div>
        </header>
      ) : null}
      <div className={hideNav ? "flex-1" : "flex-1 pb-nav"}>{children}</div>
      {!hideNav ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg bg-surface/95 px-1 pt-1 shadow-card backdrop-blur-md"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <ul className="grid grid-cols-5">
            {TABS.map((tab) => {
              const active =
                tab.to === "/"
                  ? pathname === "/"
                  : pathname === tab.to || pathname.startsWith(`${tab.to}/`);
              const Icon = tab.icon;
              return (
                <li key={tab.to} className="flex justify-center">
                  <Link
                    to={tab.to}
                    className={cn(
                      "flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-2xs font-medium",
                      tab.prominent ? "text-primary" : active ? "text-primary" : "text-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "grid place-items-center",
                        tab.prominent
                          ? "-mt-6 size-14 rounded-full bg-primary text-primary-fg shadow-float"
                          : "size-8 rounded-xl",
                        !tab.prominent && active && "bg-primary-soft text-primary",
                      )}
                    >
                      <Icon className={tab.prominent ? "size-6" : "size-5"} strokeWidth={1.9} />
                    </span>
                    <span className={tab.prominent ? "mt-0.5" : undefined}>{t(tab.key)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
