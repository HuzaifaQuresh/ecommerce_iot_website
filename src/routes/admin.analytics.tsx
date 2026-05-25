import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fmtPKR } from "@/lib/format";
import { StatCard } from "@/components/dashboard/StatCard";
import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getMockAnalytics } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/analytics")({ component: AdminAnalytics });

function AdminAnalytics() {
  const { data } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      try {
        const [orders, products] = await Promise.all([
          supabase.from("orders").select("total_pkr,status,created_at"),
          supabase.from("products").select("category"),
        ]);
        if ((products.data?.length ?? 0) > 0) {
          const byStatus: Record<string, number> = {};
          let revenue = 0;
          for (const o of orders.data ?? []) {
            revenue += Number(o.total_pkr);
            byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
          }
          const byCat: Record<string, number> = {};
          for (const p of products.data ?? []) byCat[p.category] = (byCat[p.category] ?? 0) + 1;
          const chart = Object.entries(byCat).map(([name, count]) => ({ name, count }));
          return {
            revenue,
            orderCount: orders.data?.length ?? 0,
            skuCount: products.data?.length ?? 0,
            byStatus,
            chart,
          };
        }
      } catch {
        /* demo */
      }
      const m = getMockAnalytics();
      return {
        revenue: m.revenue,
        orderCount: m.orders,
        skuCount: m.products,
        byStatus: m.byStatus,
        chart: m.chart,
      };
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={fmtPKR(data?.revenue ?? 0)} icon={DollarSign} />
        <StatCard label="Orders" value={data?.orderCount ?? 0} icon={ShoppingBag} />
        <StatCard label="SKUs" value={data?.skuCount ?? 0} icon={Package} />
        <StatCard label="Pending" value={data?.byStatus?.pending ?? 0} icon={TrendingUp} />
      </div>
      <div className="rounded-lg border bg-card p-5 h-80">
        <h2 className="font-semibold mb-4">Products by category</h2>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data?.chart ?? []}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
