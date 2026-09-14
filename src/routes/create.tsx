import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Briefcase, Check, Store, Wrench, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { RedirectToSignIn, SignInGate } from "@/lib/auth/gates";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  DISTRICTS,
  STOCK_PHOTOS,
  TASK_GROUPS,
  TASKS,
  categoriesFor,
  districtName,
  pricingFor,
  type ListingKind,
  type OfferType,
} from "@/lib/constants";
import { useT } from "@/lib/i18n";
import { createListing } from "@/lib/server/listings";
import { getMyProfile } from "@/lib/server/community";
import { previewFacebookProfile } from "@/lib/server/facebook";
import { cn, initials } from "@/lib/utils";

export const Route = createFileRoute("/create")({ component: CreatePage });

function CreatePage() {
  const { isPending, user } = useCurrentUserState();
  if (isPending) return <div className="h-40 animate-pulse bg-surface-2" />;
  if (!user) return <RedirectToSignIn />;
  return (
    <SignInGate fallback={<RedirectToSignIn />}>
      <CreateForm />
    </SignInGate>
  );
}

function CreateForm() {
  const { lang, t } = useT();
  const user = useCurrentUser();
  const nav = useNavigate();
  const [kind, setKind] = useState<ListingKind | null>(null);
  const [offerType, setOfferType] = useState<OfferType>("offer");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [pricing, setPricing] = useState<"hourly" | "daily" | "monthly" | "flat" | "sale">("hourly");
  const [price, setPrice] = useState("");
  const [district, setDistrict] = useState<string>(DISTRICTS[0].id);
  const [times, setTimes] = useState("");
  const [radius, setRadius] = useState("8");
  const [images, setImages] = useState<string[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [facebook, setFacebook] = useState("");
  const [fbQuery, setFbQuery] = useState("");
  const [fbReady, setFbReady] = useState(false);
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMyProfile() });
  useEffect(() => {
    if (fbReady || me.data === undefined) return;
    if (me.data?.facebookUrl) setFacebook(me.data.facebookUrl);
    setFbReady(true);
  }, [me.data, fbReady]);
  useEffect(() => {
    const tmr = setTimeout(() => setFbQuery(facebook.trim()), 500);
    return () => clearTimeout(tmr);
  }, [facebook]);
  const fbPreview = useQuery({
    queryKey: ["fb-preview", fbQuery],
    queryFn: () => previewFacebookProfile({ data: { url: fbQuery } }),
    enabled: fbQuery.length > 4,
    staleTime: 60_000,
  });

  const cats = kind ? categoriesFor(kind) : [];
  const prices = kind ? pricingFor(kind) : [];

  function pickKind(next: ListingKind, offer: OfferType = "offer") {
    setKind(next);
    setCategory("");
    setTasks([]);
    setOfferType(offer);
    if (next === "job") setPricing("monthly");
    else if (next === "market") setPricing("sale");
    else setPricing("hourly");
  }

  async function onFile(file: File) {
    const bmp = await createImageBitmap(file);
    const max = 900;
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL("image/jpeg", 0.8);
    setImages((prev) => [...prev, url].slice(0, 4));
  }

  const offerLabels = useMemo(() => {
    if (kind === "job") {
      return { offer: t("postJob"), wanted: t("lookingWork") };
    }
    if (kind === "market") {
      return { offer: t("sellItem"), wanted: t("wantToBuy") };
    }
    return { offer: t("offering"), wanted: t("lookingFor") };
  }, [kind, t]);

  const publish = useMutation({
    mutationFn: async () => {
      if (!kind || !title.trim() || !description.trim() || !category) {
        throw new Error(t("minChars"));
      }
      const stock = STOCK_PHOTOS[category];
      const photos = images.length ? images : stock ? [stock] : [];
      const unpaid = false;
      return createListing({
        data: {
          title,
          description,
          kind,
          category,
          offerType,
          pricingType: pricing,
          rateThb: unpaid ? 0 : Number(price) || null,
          locationRadius: Number(radius) || 8,
          images: photos,
          tasks,
          district,
          availableTimes: times || null,
          name: user?.displayName,
          lang,
          facebookUrl: facebook || null,
        },
      });
    },
    onSuccess: (res) => {
      toast.success(t("published"));
      nav({ to: "/service/$id", params: { id: res.id } });
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "Unauthorized") nav({ to: "/login", search: { next: "/create" } });
      else toast.error(msg || t("loadError"));
    },
  });

  if (!kind) {
    return (
      <main className="px-4 py-6">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">{t("chooseKind")}</h1>
        <p className="mb-6 text-sm text-muted">{t("newListing")}</p>
        <div className="space-y-3">
          <KindCard
            icon={Wrench}
            title={t("offerService")}
            hint={t("kindServiceHint")}
            onClick={() => pickKind("service")}
          />
          <KindCard
            icon={Briefcase}
            title={t("jobs")}
            hint={t("kindJobHint")}
            onClick={() => pickKind("job")}
          />
          <KindCard
            icon={Store}
            title={t("market")}
            hint={t("kindMarketHint")}
            onClick={() => pickKind("market")}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-5">
      <button type="button" className="mb-4 text-sm font-medium text-muted" onClick={() => setKind(null)}>
        {t("back")}
      </button>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">
        {kind === "job" ? t("jobs") : kind === "market" ? t("market") : t("offerService")}
      </h1>
      <p className="mb-5 text-sm text-muted">{t("offerOrWant")}</p>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          publish.mutate();
        }}
      >
        <div className="grid grid-cols-2 gap-2">
          {(["offer", "wanted"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setOfferType(id)}
              className={cn(
                "rounded-2xl px-3 py-3 text-left text-sm font-medium shadow-card",
                offerType === id ? "bg-primary text-primary-fg" : "bg-surface text-muted",
              )}
            >
              {id === "offer" ? offerLabels.offer : offerLabels.wanted}
            </button>
          ))}
        </div>

        <div>
          <Label>{t("title")}</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label>{t("description")}</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <Label>{t("category")}</Label>
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={cn(
                  "h-9 rounded-full px-3 text-sm font-medium",
                  category === c.id ? "bg-primary text-primary-fg" : "bg-surface text-muted shadow-card",
                )}
              >
                {lang === "th" ? c.nameTh : c.nameEn}
              </button>
            ))}
          </div>
        </div>

        {kind !== "market" ? (
        <div>
          <Label>{t("tasks")}</Label>
          <p className="mb-2 text-xs text-muted">{t("tasksHint")}</p>
          <div className="space-y-3">
            {TASK_GROUPS.map((g) => (
              <div key={g.id}>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-faint">
                  {lang === "th" ? g.nameTh : g.nameEn}
                </p>
                <div className="flex flex-wrap gap-2">
                  {TASKS.filter((task) => task.group === g.id).map((task) => {
                    const on = tasks.includes(task.id);
                    return (
                      <button
                        key={task.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          setTasks((prev) =>
                            on ? prev.filter((x) => x !== task.id) : [...prev, task.id],
                          )
                        }
                        className={cn(
                          "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium",
                          on ? "bg-fg text-primary-fg" : "bg-surface text-muted shadow-card",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-4 place-items-center rounded border",
                            on ? "border-primary-fg bg-primary-fg text-fg" : "border-current",
                          )}
                        >
                          {on ? <Check className="size-3" strokeWidth={3} /> : null}
                        </span>
                        {lang === "th" ? task.nameTh : task.nameEn}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        ) : null}

        <div>
          <Label>{t("pricing")}</Label>
          <div className="flex flex-wrap gap-2">
            {prices.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPricing(c.id as typeof pricing)}
                className={cn(
                  "h-9 rounded-full px-3 text-sm font-medium",
                  pricing === c.id ? "bg-fg text-primary-fg" : "bg-surface text-muted shadow-card",
                )}
              >
                {lang === "th" ? c.nameTh : c.nameEn}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("priceRate")}</Label>
            <Input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          {kind !== "market" ? (
            <div>
              <Label>{t("radius")}</Label>
              <Input inputMode="numeric" value={radius} onChange={(e) => setRadius(e.target.value)} />
            </div>
          ) : null}
        </div>
        {kind !== "market" ? (
          <div>
            <Label>{t("times")}</Label>
            <Input value={times} onChange={(e) => setTimes(e.target.value)} />
          </div>
        ) : null}
        <div>
          <Label>{t("district")}</Label>
          <div className="flex flex-wrap gap-2">
            {DISTRICTS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDistrict(d.id)}
                className={cn(
                  "h-9 rounded-full px-3 text-sm font-medium",
                  district === d.id ? "bg-primary text-primary-fg" : "bg-surface text-muted shadow-card",
                )}
              >
                {districtName(d.id, lang)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>{t("photos")}</Label>
          <div className="flex gap-2 overflow-x-auto">
            {images.map((src) => (
              <img key={src.slice(0, 24)} src={src} alt="" className="size-20 rounded-xl object-cover" />
            ))}
            <label className="grid size-20 shrink-0 cursor-pointer place-items-center rounded-xl bg-surface text-xs text-muted shadow-card">
              {t("addPhoto")}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onFile(f);
                }}
              />
            </label>
          </div>
          {category && STOCK_PHOTOS[category] ? (
            <button
              type="button"
              className="mt-2 text-sm font-medium text-primary"
              onClick={() => setImages([STOCK_PHOTOS[category]])}
            >
              {t("useStock")}
            </button>
          ) : null}
        </div>
        <div>
          <Label>{t("facebook")}</Label>
          <Input
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="facebook.com/your.profile"
            inputMode="url"
            autoComplete="url"
          />
          <p className="mt-1.5 text-xs text-muted">{t("facebookHint")}</p>
          {fbPreview.data ? (
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card">
              <span className="grid size-12 place-items-center overflow-hidden rounded-full bg-primary-soft text-sm font-semibold text-primary">
                {fbPreview.data.photo ? (
                  <img src={fbPreview.data.photo} alt="" className="size-12 object-cover" />
                ) : (
                  initials(fbPreview.data.name)
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{fbPreview.data.name}</p>
                <p className="truncate text-xs text-muted">{t("facebookConnected")}</p>
              </div>
            </div>
          ) : fbPreview.isFetching ? (
            <p className="mt-2 text-xs text-muted">{t("facebookLoading")}</p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={publish.isPending}>
          {publish.isPending ? t("translating") : t("publish")}
        </Button>
      </form>
    </main>
  );
}

function KindCard({
  icon: Icon,
  title,
  hint,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-2xl bg-surface p-4 text-left shadow-card transition-transform duration-150 active:scale-[0.99]"
    >
      <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="size-5" />
      </span>
      <span>
        <span className="block font-medium">{title}</span>
        <span className="mt-0.5 block text-sm text-muted">{hint}</span>
      </span>
    </button>
  );
}
