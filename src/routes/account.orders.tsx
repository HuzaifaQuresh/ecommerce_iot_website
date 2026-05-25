import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchOrdersWithItems } from "@/api/orders";
import { useAuth } from "@/hooks/useAuth";
import { fmtPKR } from "@/lib/format";
import { formatDeliveryDate } from "@/lib/order-fulfillment";
import { Button } from "@/components/ui/button";
import { EmptyState, SectionCard } from "@/components/site/PageLayout";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Package, ShoppingBag, ChevronRight, Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/account/orders")({ component: AccountOrders });

function AccountOrders() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders-full", user?.id],
    enabled: !!user?.id,
    queryFn: () => fetchOrdersWithItems({ userId: user!.id }),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-28 rounded-xl border bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="When you checkout, your order history will appear here with tracking and delivery dates."
        action={
          <Button asChild>
            <Link to="/products">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse catalog
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <SectionCard title={`Order history (${data.length})`}>
      <div className="space-y-3">
        {data.map((o) => (
          <Link
            key={o.id}
            to="/account/orders/$orderId"
            params={{ orderId: o.id }}
            className="block rounded-xl border bg-background p-4 sm:p-5 hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </span>
                  <OrderStatusBadge status={o.status} />
                </div>
                <p className="font-semibold text-lg mt-2">{fmtPKR(Number(o.total_pkr))}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                  {o.items[0] && ` · ${o.items[0].title}${o.items.length > 1 ? "…" : ""}`}
                </p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Est. {formatDeliveryDate(o.expected_delivery_at, o.delivery_method)}
                  </span>
                  {(o.city || o.province) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {o.city}
                      {o.province ? `, ${o.province}` : ""}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary shrink-0 self-center" />
            </div>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
