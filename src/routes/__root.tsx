import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { GrokChromeGate } from "@/components/grok-chrome-gate";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const APP_NAME = "CAPTAIN TIDE";

export const Route = createRootRoute({
  head: ({ matches }) => {
    const game = matches.some((m) => (m.routeId as string) === "/abenteuer");
    return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: game ? "Rabenschwur" : APP_NAME },
      { name: "theme-color", content: game ? "#050404" : "#070d14" },
      { name: "apple-mobile-web-app-title", content: game ? "Rabenschwur" : "Captain Tide" },
      {
        httpEquiv: "Content-Security-Policy",
        content:
          "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.blob.vercel-storage.com https:",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/tide/icon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: game ? "/game/manifest.webmanifest" : "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: game ? "/game/icon-180.png" : "/tide/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
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
        <GrokChromeGate />
        <AuthProvider>
          <Outlet />
          <Toaster richColors position="top-center" />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
