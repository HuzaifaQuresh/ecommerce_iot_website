import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/dashboard/StatCard";
import { Eye, Star, Package } from "lucide-react";
import { DEMO_VENDOR_ID, getVendorMockProducts } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/analytics")({ component: VendorAnalytics });

function VendorAnalytics() {
  const { vendorId } = Route.useRouteContext();
  const { data } = useQuery({
    queryKey: ["vendor-analytics", vendorId],
    queryFn: async () => {
      const vid = vendorId ?? DEMO_VENDOR_ID;
      try {
        const { data: rows, error } = await supabase
          .from("products")
          .select("rating,stock,discount_pct")
          .eq("vendor_id", vid);
        if (error) throw error;
        if (rows?.length) {
          const avgRating = rows.reduce((s, p) => s + Number(p.rating ?? 0), 0) / rows.length;
          const onSale = rows.filter((p) => p.discount_pct > 0).length;
          return { skus: rows.length, avgRating, onSale };
        }
      } catch {
        /* demo */
      }
      const products = getVendorMockProducts(vid);
      const avgRating = products.reduce((s, p) => s + Number(p.rating ?? 0), 0) / (products.length || 1);
      const onSale = products.filter((p) => p.discount_pct > 0).length;
      return { skus: products.length, avgRating, onSale };
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Vendor Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Active SKUs" value={data?.skus ?? 0} icon={Package} />
        <StatCard label="Avg rating" value={(data?.avgRating ?? 0).toFixed(1)} icon={Star} />
        <StatCard label="On promotion" value={data?.onSale ?? 0} icon={Eye} />
      </div>
    </div>
  );
}
