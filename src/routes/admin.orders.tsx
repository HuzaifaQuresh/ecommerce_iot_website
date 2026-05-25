import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "@/api/orders";
import { fmtPKR } from "@/lib/format";
import { formatDeliveryDate } from "@/lib/order-fulfillment";
import { DashboardPageHeader, ResponsiveScroll } from "@/components/site/PageLayout";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/orders")({ component: Orders });

function Orders() {
  const { data } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      try {
        const list = await fetchOrders();
        if (list.length) return list;
      } catch {
        /* demo */
      }
      return MOCK_ORDERS;
    },
  });

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Orders"
        description="View shipping addresses, line items, dispatch status, and expected delivery dates."
      />
      <ResponsiveScroll>
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Ship to</th>
              <th className="p-3 font-medium">Est. delivery</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {data?.map((o) => (
              <tr key={o.id} className="border-t hover:bg-muted/20">
                <td className="p-3 font-mono text-xs">{o.id.slice(0, 8).toUpperCase()}</td>
                <td className="p-3">
                  <div className="font-medium">{o.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{o.phone}</div>
                </td>
                <td className="p-3 text-xs max-w-[200px]">
                  <div className="line-clamp-2">{o.address}</div>
                  <div className="text-muted-foreground">
                    {o.city}
                    {o.province ? `, ${o.province}` : ""}
                  </div>
                </td>
                <td className="p-3 text-xs whitespace-nowrap">
                  {formatDeliveryDate(o.expected_delivery_at, o.delivery_method)}
                </td>
                <td className="p-3 font-semibold tabular-nums">{fmtPKR(Number(o.total_pkr))}</td>
                <td className="p-3">
                  <OrderStatusBadge status={o.status} />
                </td>
                <td className="p-3">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin/orders/$orderId" params={{ orderId: o.id }}>
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Details
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ResponsiveScroll>
    </div>
  );
}
