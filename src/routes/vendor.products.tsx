import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fmtPKR } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { getVendorMockProducts } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/products")({ component: VendorProducts });

function VendorProducts() {
  const { vendorId } = Route.useRouteContext();
  const { data } = useQuery({
    queryKey: ["vendor-products", vendorId],
    queryFn: async () => {
      try {
        let q = supabase.from("products").select("*").order("created_at", { ascending: false });
        if (vendorId) q = q.eq("vendor_id", vendorId);
        const { data, error } = await q;
        if (error) throw error;
        if (data?.length) return data;
      } catch {
        /* demo */
      }
      return getVendorMockProducts(vendorId);
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Products</h1>
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {data?.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3">{fmtPKR(Number(p.price_pkr))}</td>
                <td className={`p-3 ${p.stock < 15 ? "text-amber-600 font-semibold" : ""}`}>{p.stock}</td>
                <td className="p-3 text-right">
                  <Link to="/products/$slug" params={{ slug: p.slug }} className="text-primary text-xs hover:underline">
                    View storefront
                  </Link>
                </td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No products assigned to your vendor account yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
