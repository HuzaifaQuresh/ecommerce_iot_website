import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fmtPKR } from "@/lib/format";
import { Package, ShoppingBag, DollarSign, AlertTriangle, Users, Settings, Ticket } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardPageHeader } from "@/components/site/PageLayout";
import { getMockAnalytics } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const { isSuperAdmin: isSuper } = useAuth();
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      try {
        const [p, o, lowStock] = await Promise.all([
          supabase.from("products").select("id", { count: "exact", head: true }),
          supabase.from("orders").select("id,total_pkr,status"),
          supabase.from("products").select("id,title,stock").lt("stock", 15).order("stock"),
        ]);
        if ((p.count ?? 0) > 0 || (o.data?.length ?? 0) > 0) {
          const revenue = (o.data ?? []).reduce((s, x) => s + Number(x.total_pkr), 0);
          return { products: p.count ?? 0, orders: o.data?.length ?? 0, revenue, low: lowStock.data ?? [] };
        }
      } catch {
        /* demo */
      }
      const m = getMockAnalytics();
      return { products: m.products, orders: m.orders, revenue: m.revenue, low: m.low };
    },
  });
  const cards = [
    { label: "Products", value: stats?.products ?? 0, icon: Package },
    { label: "Orders", value: stats?.orders ?? 0, icon: ShoppingBag },
    { label: "Revenue", value: fmtPKR(stats?.revenue ?? 0), icon: DollarSign },
    { label: "Low Stock", value: stats?.low.length ?? 0, icon: AlertTriangle },
  ];
  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Dashboard" description="Platform overview and stock alerts." />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} />
        ))}
      </div>
      {stats?.low && stats.low.length > 0 && (
        <div className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Low Stock Alerts</h2>
          <div className="space-y-2">
            {stats.low.map((p) => (
              <div key={p.id} className="flex justify-between text-sm border-b pb-2">
                <span>{p.title}</span>
                <span className="text-warning font-medium">{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/admin/products" className="rounded-lg border bg-card p-4 hover:border-primary/40 transition-colors">
          <Package className="h-5 w-5 text-primary mb-2" />
          <div className="font-semibold text-sm">Products</div>
        </Link>
        <Link to="/admin/orders" className="rounded-lg border bg-card p-4 hover:border-primary/40 transition-colors">
          <ShoppingBag className="h-5 w-5 text-primary mb-2" />
          <div className="font-semibold text-sm">Orders</div>
        </Link>
        <Link to="/admin/vouchers" className="rounded-lg border bg-card p-4 hover:border-primary/40 transition-colors">
          <Ticket className="h-5 w-5 text-primary mb-2" />
          <div className="font-semibold text-sm">Vouchers</div>
        </Link>
        <Link to="/admin/settings" className="rounded-lg border bg-card p-4 hover:border-primary/40 transition-colors">
          <Settings className="h-5 w-5 text-primary mb-2" />
          <div className="font-semibold text-sm">Settings</div>
        </Link>
        {isSuper && (
          <Link
            to="/admin/users"
            className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 hover:border-amber-500/50 transition-colors sm:col-span-2"
          >
            <Users className="h-5 w-5 text-amber-600 mb-2" />
            <div className="font-semibold text-sm">Users & Roles</div>
            <p className="text-xs text-muted-foreground mt-1">Super admin — assign vendor, admin, super_admin</p>
          </Link>
        )}
      </div>
    </div>
  );
}