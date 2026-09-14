import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ListingDetail } from "@/components/listings/listing-detail";
import { getListing } from "@/lib/server/listings";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/item/$id")({ component: ItemPage });

function ItemPage() {
  const { id } = Route.useParams();
  const { lang, t } = useT();
  const q = useQuery({
    queryKey: ["item", id, lang],
    queryFn: () => getListing({ data: { id, locale: lang } }),
  });
  if (q.isLoading) return <div className="h-64 animate-pulse bg-surface-2" />;
  if (!q.data) return <p className="p-6 text-sm text-muted">{t("loadError")}</p>;
  return <ListingDetail card={q.data} />;
}
