import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Logo } from "@/components/logo";
import { LanguagePill } from "@/components/layout/language-pill";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" && search.next.startsWith("/") ? search.next : "",
  }),
  component: Login,
});

function Login() {
  const { t } = useT();
  const { user, isPending } = useCurrentUserState();
  const next = Route.useSearch().next;
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isPending && user) {
    return <Navigate to={next || "/"} />;
  }

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({ email, password, name });
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) throw new Error(err.message);
      }
      window.location.href = next || "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center px-5 py-10">
      <div className="mx-auto mb-6">
        <LanguagePill />
      </div>
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="space-y-3 text-center">
          <Logo variant="photo" className="mx-auto size-20" />
          <h1 className="text-2xl font-semibold tracking-tight">{t("signInTitle")}</h1>
          <p className="text-sm leading-relaxed text-muted">{t("signInBody")}</p>
        </div>
        {authEnabled ? (
          <div className="space-y-2">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                {p.providerId === "grok-google" ? t("continueGoogle") : t("continueX")}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">{t("loginDisabled")}</p>
        )}
        <p className="text-center text-xs font-medium uppercase tracking-wide text-faint">{t("orEmail")}</p>
        <form onSubmit={onEmail} className="space-y-3">
          {mode === "up" ? (
            <div>
              <Label htmlFor="name">{t("name")}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          ) : null}
          <div>
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "up" ? t("signUp") : t("signIn")}
          </Button>
        </form>
        <button
          type="button"
          className="w-full text-sm text-muted"
          onClick={() => setMode(mode === "up" ? "in" : "up")}
        >
          {mode === "up" ? t("haveAccount") : t("needAccount")}
        </button>
      </div>
    </main>
  );
}
