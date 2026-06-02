import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fmtPKR } from "@/lib/format";
import { getVendorMockProducts } from "@/lib/mock-data";
import { DashboardPageHeader, ResponsiveScroll, EmptyState } from "@/components/site/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, ExternalLink, Save, X, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/vendor/products")({ component: VendorProducts });

function VendorProducts() {
  const { vendorId } = Route.useRouteContext();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Record<string, { stock: string; price_pkr: string }>>({});

  const { data, isLoading } = useQuery({
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

  const startEdit = (id: string, stock: number, price_pkr: number) => {
    setEditing((e) => ({ ...e, [id]: { stock: String(stock), price_pkr: String(price_pkr) } }));
  };

  const cancelEdit = (id: string) => {
    setEditing((e) => { const n = { ...e }; delete n[id]; return n; });
  };

  const saveEdit = async (id: string) => {
    const vals = editing[id];
    if (!vals) return;
    const stock = parseInt(vals.stock, 10);
    const price_pkr = parseFloat(vals.price_pkr);
    if (isNaN(stock) || stock < 0) return toast.error("Stock must be 0 or more");
    if (isNaN(price_pkr) || price_pkr <= 0) return toast.error("Price must be greater than 0");

    const { error } = await supabase.from("products").update({ stock, price_pkr }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product updated");
    cancelEdit(id);
    qc.invalidateQueries({ queryKey: ["vendor-products", vendorId] });
  };

  const lowStock = (data ?? []).filter((p) => p.stock < 15).length;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="My Products"
        description="Update stock and pricing for your assigned SKUs."
        actions={
          lowStock > 0 ? (
            <Badge variant="outline" className="text-amber-600 border-amber-500/40 bg-amber-500/10">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {lowStock} low stock
            </Badge>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="h-40 rounded-xl border bg-muted/30 animate-pulse" />
      ) : !data?.length ? (
        <EmptyState
          icon={Package}
          title="No products assigned"
          description="Ask a platform admin to assign your vendor SKUs."
        />
      ) : (
        <ResponsiveScroll>
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="p-3 font-semibold">Product</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Price (PKR)</th>
                <th className="p-3 font-semibold">Stock</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => {
                const isEditing = !!editing[p.id];
                const isLow = p.stock < 15;
                return (
                  <tr key={p.id} className="border-t hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="font-medium line-clamp-1">{p.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">{p.slug}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.category}</td>
                    <td className="p-3">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          className="w-28 h-8 text-sm"
                          value={editing[p.id].price_pkr}
                          onChange={(e) =>
                            setEditing((ed) => ({ ...ed, [p.id]: { ...ed[p.id], price_pkr: e.target.value } }))
                          }
                        />
                      ) : (
                        <span className="tabular-nums">{fmtPKR(Number(p.price_pkr))}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          className="w-20 h-8 text-sm"
                          value={editing[p.id].stock}
                          onChange={(e) =>
                            setEditing((ed) => ({ ...ed, [p.id]: { ...ed[p.id], stock: e.target.value } }))
                          }
                        />
                      ) : (
                        <span className={isLow ? "text-amber-600 font-semibold" : "tabular-nums"}>{p.stock}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                          p.availability === "in_stock"
                            ? "bg-emerald-500/10 text-emerald-700"
                            : isLow
                            ? "bg-amber-500/10 text-amber-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isLow ? "Low stock" : p.availability === "in_stock" ? "In stock" : p.availability}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        {isEditing ? (
                          <>
                            <Button size="sm" onClick={() => saveEdit(p.id)} className="h-8">
                              <Save className="h-3.5 w-3.5 mr-1" /> Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => cancelEdit(p.id)} className="h-8">
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => startEdit(p.id, p.stock, Number(p.price_pkr))}
                            >
                              Edit
                            </Button>
                            <Button asChild size="sm" variant="ghost" className="h-8">
                              <Link to="/products/$slug" params={{ slug: p.slug }}>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ResponsiveScroll>
      )}

      {!vendorId && (
        <p className="text-sm text-muted-foreground bg-muted/50 border rounded-xl p-4">
          <strong className="text-foreground">Demo mode</strong> — showing sample catalog. A super admin can link your
          vendor account in Admin → Users & Roles to show your actual products.
        </p>
      )}
    </div>
  );
}
