import { Link } from "@tanstack/react-router";
import { fmtPKR } from "@/lib/format";
import { formatDeliveryDate } from "@/lib/order-fulfillment";
import type { OrderWithItems } from "@/types/commerce";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { ShippingAddressCard } from "@/components/orders/ShippingAddressCard";
import { OrderLineItems } from "@/components/orders/OrderLineItems";
import { SectionCard } from "@/components/site/PageLayout";
import { Calendar, CreditCard, Hash, Truck } from "lucide-react";

export function OrderDetailView({
  order,
  backTo,
  backLabel,
  showAdminControls,
  onItemStatusChange,
  adminSlot,
}: {
  order: OrderWithItems;
  backTo: string;
  backLabel: string;
  showAdminControls?: boolean;
  onItemStatusChange?: (itemId: string, status: string) => void;
  adminSlot?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link to={backTo} className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">
            ← {backLabel}
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Placed {new Date(order.created_at).toLocaleString("en-PK", { dateStyle: "full", timeStyle: "short" })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <SectionCard title="Order progress">
        <OrderTimeline status={order.status} />
      </SectionCard>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Delivery estimate</h3>
          <p className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {formatDeliveryDate(order.expected_delivery_at, order.delivery_method)}
          </p>
          <p className="text-sm text-muted-foreground capitalize">
            Method: {order.delivery_method?.replace(/_/g, " ") ?? "standard"}
          </p>
          {order.tracking_number && (
            <p className="text-sm flex items-center gap-2 font-mono">
              <Hash className="h-4 w-4 text-primary" />
              {order.tracking_number}
            </p>
          )}
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Payment</h3>
          <p className="capitalize flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            {String(order.payment_method ?? "cod").replace(/_/g, " ")}
          </p>
          <div className="border-t pt-2 space-y-1 text-sm">
            {order.subtotal_pkr != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{fmtPKR(Number(order.subtotal_pkr))}</span>
              </div>
            )}
            {Number(order.shipping_pkr) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{fmtPKR(Number(order.shipping_pkr))}</span>
              </div>
            )}
            {Number(order.tax_pkr) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{fmtPKR(Number(order.tax_pkr))}</span>
              </div>
            )}
            {Number(order.discount_pkr) > 0 && (
              <div className="flex justify-between text-primary">
                <span>Discount</span>
                <span>−{fmtPKR(Number(order.discount_pkr))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1">
              <span>Total</span>
              <span>{fmtPKR(Number(order.total_pkr))}</span>
            </div>
          </div>
        </div>
      </div>

      <ShippingAddressCard order={order} />

      <SectionCard title={`Products (${order.items.length})`}>
        <OrderLineItems
          items={order.items}
          showAdminControls={showAdminControls}
          onStatusChange={onItemStatusChange}
        />
      </SectionCard>

      {adminSlot}
    </div>
  );
}
