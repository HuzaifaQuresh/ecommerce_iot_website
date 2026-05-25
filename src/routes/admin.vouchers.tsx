import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MOCK_VOUCHERS } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/vouchers")({ component: AdminVouchers });

function AdminVouchers() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", label: "", discount_pct: 10, min_order_pkr: 5000 });

  const { data } = useQuery({
    queryKey: ["admin-vouchers"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("vouchers").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        if (data?.length) return data;
      } catch {
        /* demo */
      }
      return MOCK_VOUCHERS;
    },
  });

  const save = async () => {
    const { error } = await supabase.from("vouchers").insert({
      code: form.code.toUpperCase(),
      label: form.label,
      discount_pct: form.discount_pct,
      min_order_pkr: form.min_order_pkr,
    });
    if (error) return toast.error(error.message);
    toast.success("Voucher created");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-vouchers"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete voucher?")) return;
    const { error } = await supabase.from("vouchers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-vouchers"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Vouchers</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" /> New voucher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create voucher</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div>
                <Label>Label</Label>
                <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
              </div>
              <div>
                <Label>Discount %</Label>
                <Input type="number" value={form.discount_pct} onChange={(e) => setForm({ ...form, discount_pct: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Min order PKR</Label>
                <Input type="number" value={form.min_order_pkr} onChange={(e) => setForm({ ...form, min_order_pkr: Number(e.target.value) })} />
              </div>
              <Button className="w-full" onClick={save}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Min order</th>
              <th className="p-3">Uses</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {data?.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="p-3 font-mono font-semibold">{v.code}</td>
                <td className="p-3">{v.discount_pct}% / PKR {Number(v.discount_flat_pkr)}</td>
                <td className="p-3">{Number(v.min_order_pkr).toLocaleString()}</td>
                <td className="p-3">
                  {v.used_count}
                  {v.max_uses != null ? ` / ${v.max_uses}` : ""}
                </td>
                <td className="p-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => del(v.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
