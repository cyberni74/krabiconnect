import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ListingDetail } from "@/components/listings/listing-detail";
import { getListing } from "@/lib/server/listings";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/service/$id")({ component: ServicePage });

function ServicePage() {
  const { id } = Route.useParams();
  const { t } = useT();
  const q = useQuery({
    queryKey: ["service", id],
    queryFn: () => getListing({ data: { id } }),
  });
  if (q.isLoading) return <div className="h-64 animate-pulse bg-surface-2" />;
  if (!q.data) return <p className="p-6 text-sm text-muted">{t("loadError")}</p>;
  return <ListingDetail card={q.data} />;
}
