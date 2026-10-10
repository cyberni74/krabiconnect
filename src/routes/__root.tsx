import { createRootRoute, HeadContent, Outlet, redirect, Scripts } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { GrokChromeGate } from "@/components/grok-chrome-gate";
import { QueryProvider } from "@/components/query-provider";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "sonner";
import { isTideOnlyHost, isTidePath } from "@/lib/tide/hosts";
import appCss from "../styles.css?url";

const APP_NAME = "KrabiMarketplace";

const fetchSessionUser = createServerFn({ method: "GET" }).handler(async () => {
  const { ensureAdmin } = await import("@/lib/server/admin-boot.server");
  await ensureAdmin();
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const u = await getSessionUser();
  return u ? { id: u.id, email: u.email } : null;
});

/** Server side: is this request for a tide-only domain (e.g. cyberni.de)? */
const fetchIsTideHost = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequest } = await import("@tanstack/react-start/server");
  const h = getRequest()?.headers;
  return isTideOnlyHost(h?.get("x-forwarded-host") ?? h?.get("host"));
});

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const tideHost =
      typeof window === "undefined"
        ? await fetchIsTideHost()
        : isTideOnlyHost(window.location.hostname);
    // Tide-only domains never show the marketplace: everything leads to /tide.
    if (tideHost && !isTidePath(location.pathname)) throw redirect({ to: "/tide", replace: true });
    // CAPTAIN TIDE is public and database-free; skip the session/admin lookup there.
    return { sessionUser: isTidePath(location.pathname) ? null : await fetchSessionUser() };
  },
  head: ({ matches }) => {
    const onTide = matches.some((m) => isTidePath(m.pathname));
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
        { title: APP_NAME },
        { name: "theme-color", content: "#0088A3" },
        ...(onTide ? [{ name: "apple-mobile-web-app-title", content: "Captain Tide" }] : []),
        {
          httpEquiv: "Content-Security-Policy",
          content:
            "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.blob.vercel-storage.com https:",
        },
        {
          name: "description",
          content:
            "KrabiMarketplace — local services, jobs and classifieds in Krabi. Thai and English, auto-translated.",
        },
      ],
      links: [
        onTide
          ? { rel: "icon", type: "image/svg+xml", href: "/tide/icon.svg" }
          : { rel: "icon", type: "image/jpeg", href: "/brand/mark.jpg" },
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/__grok/manifest.webmanifest" },
        onTide
          ? { rel: "apple-touch-icon", href: "/tide/icon-180.png" }
          : { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Kanit:wght@400;500;600;700&display=swap",
        },
      ],
    };
  },
  component: Root,
});

function Root() {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg">
        <PreviewHostBridge />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|; )krabimarketplace-lang=(th|en)/);var lang=m?m[1]:null;if(!lang){var n=String(navigator.language||"").toLowerCase().replace("_","-");lang=n.indexOf("th")===0?"th":"en";}document.documentElement.lang=lang;}catch(e){}})();`,
          }}
        />
        <GrokChromeGate />
        <AuthProvider>
          <QueryProvider>
            <AppShell>
              <Outlet />
            </AppShell>
            <Toaster richColors position="top-center" />
          </QueryProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
