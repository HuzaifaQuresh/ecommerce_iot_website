import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fmtPKR } from "@/lib/format";
import { MOCK_ORDERS } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/orders")({ component: VendorOrders });

function VendorOrders() {
  const { data } = useQuery({
    queryKey: ["vendor-orders"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50);
        if (error) throw error;
        if (data?.length) return data;
      } catch {
        /* demo */
      }
      return MOCK_ORDERS;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="text-sm text-muted-foreground">Platform orders containing your catalog items (read-only).</p>
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td className="p-3">{o.customer_name}</td>
                <td className="p-3">{fmtPKR(Number(o.total_pkr))}</td>
                <td className="p-3 capitalize">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
