import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/dashboard/StatCard";
import { Package, ShoppingBag, AlertTriangle, DollarSign, BarChart3, Store } from "lucide-react";
import { fmtPKR } from "@/lib/format";
import { DashboardPageHeader } from "@/components/site/PageLayout";
import { RoleBadge } from "@/components/dashboard/RoleBadge";
import { DEMO_VENDOR_ID, getVendorMockProducts } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/")({ component: VendorDashboard });

function VendorDashboard() {
  const { vendorId } = Route.useRouteContext();

  const { data } = useQuery({
    queryKey: ["vendor-stats", vendorId],
    queryFn: async () => {
      const vid = vendorId ?? DEMO_VENDOR_ID;
      try {
        const { data: products, error } = await supabase.from("products").select("id,stock,price_pkr").eq("vendor_id", vid);
        if (error) throw error;
        if (products?.length) {
          const low = products.filter((p) => p.stock < 15);
          const inventoryValue = products.reduce((s, p) => s + Number(p.price_pkr) * p.stock, 0);
          return { count: products.length, low, inventoryValue };
        }
      } catch {
        /* demo */
      }
      const products = getVendorMockProducts(vid);
      const low = products.filter((p) => p.stock < 15);
      const inventoryValue = products.reduce((s, p) => s + Number(p.price_pkr) * p.stock, 0);
      return { count: products.length, low, inventoryValue };
    },
  });

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Vendor Dashboard"
        description="Your SKU inventory, stock alerts, and storefront performance."
        actions={<RoleBadge role="vendor" />}
      />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="My SKUs" value={data?.count ?? 0} icon={Package} />
        <StatCard label="Inventory value" value={fmtPKR(data?.inventoryValue ?? 0)} icon={DollarSign} />
        <StatCard label="Low stock" value={data?.low.length ?? 0} icon={AlertTriangle} />
        <StatCard label="Orders" value="—" icon={ShoppingBag} />
      </div>
      {data?.low && data.low.length > 0 && (
        <div className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold mb-3">Restock soon</h2>
          <p className="text-sm text-muted-foreground">{data.low.length} products below 15 units.</p>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/vendor/products" className="rounded-lg border bg-card p-4 hover:border-primary/40 transition-colors">
          <Package className="h-5 w-5 text-emerald-600 mb-2" />
          <div className="font-semibold text-sm">My Products</div>
        </Link>
        <Link to="/vendor/orders" className="rounded-lg border bg-card p-4 hover:border-primary/40 transition-colors">
          <ShoppingBag className="h-5 w-5 text-emerald-600 mb-2" />
          <div className="font-semibold text-sm">Orders</div>
        </Link>
        <Link to="/vendor/analytics" className="rounded-lg border bg-card p-4 hover:border-primary/40 transition-colors">
          <BarChart3 className="h-5 w-5 text-emerald-600 mb-2" />
          <div className="font-semibold text-sm">Analytics</div>
        </Link>
        <Link to="/vendor/settings" className="rounded-lg border bg-card p-4 hover:border-primary/40 transition-colors">
          <Store className="h-5 w-5 text-emerald-600 mb-2" />
          <div className="font-semibold text-sm">Shop Profile</div>
        </Link>
      </div>

      {!vendorId && (
        <p className="text-sm text-muted-foreground bg-muted/50 border rounded-lg p-4">
          Demo catalog ({data?.count ?? 0} SKUs). Super admin can assign the vendor role in Admin → Users & Roles to link your live shop.
        </p>
      )}
    </div>
  );
}
