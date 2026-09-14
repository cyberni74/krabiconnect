import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { GrokChromeGate } from "@/components/grok-chrome-gate";
import { QueryProvider } from "@/components/query-provider";
import { AppShell } from "@/components/layout/app-shell";
import { useLangStore } from "@/lib/i18n";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const APP_NAME = "KrabiMarketplace";

const fetchSessionUser = createServerFn({ method: "GET" }).handler(async () => {
  const { ensureAdmin } = await import("@/lib/server/admin-boot.server");
  await ensureAdmin();
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const u = await getSessionUser();
  return u ? { id: u.id, email: u.email } : null;
});

export const Route = createRootRoute({
  beforeLoad: async () => ({ sessionUser: await fetchSessionUser() }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0088A3" },
      {
        name: "description",
        content: "KrabiMarketplace — local services, jobs and classifieds in Krabi. Thai and English, auto-translated.",
      },
      { name: "google", content: "notranslate" },
    ],
    links: [
      { rel: "icon", type: "image/jpeg", href: "/brand/mark.jpg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Kanit:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: Root,
});

function Root() {
  const lang = useLangStore((s) => s.lang);
  return (
    <html lang={lang} translate="no" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg">
        <PreviewHostBridge />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var lang=null;try{lang=localStorage.getItem("km_locale")}catch(e){}if(lang!=="th"&&lang!=="en"){try{var legacy=localStorage.getItem("krabimarketplace-lang");if(legacy==="th"||legacy==="en")lang=legacy;else if(legacy){var p=JSON.parse(legacy);var l=(p&&p.state&&p.state.lang)||(p&&p.lang);if(l==="th"||l==="en")lang=l}}}catch(e){}}if(lang!=="th"&&lang!=="en"){var m=document.cookie.match(/(?:^|; )(?:km_locale|krabimarketplace-lang)=(th|en)/);if(m)lang=m[1]}if(lang!=="th"&&lang!=="en"){var n=String(navigator.language||"").toLowerCase().replace("_","-");lang=n.indexOf("th")===0?"th":"en"}document.documentElement.lang=lang}catch(e){}})();`,
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
