import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardPageHeader, ResponsiveScroll, SectionCard } from "@/components/site/PageLayout";
import { RoleAccessGrid } from "@/components/dashboard/RoleAccessGrid";
import { RoleBadge } from "@/components/dashboard/RoleBadge";
import { ROLE_CATALOG, slugifyShop } from "@/lib/roles";
import { toast } from "sonner";
import type { AppRole } from "@/types/commerce";
import { Users } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
    if (!roles?.some((r) => r.role === "super_admin")) throw redirect({ to: "/admin" });
  },
  component: AdminUsers,
});

type UserRow = {
  user_id: string;
  role: AppRole;
  name: string;
  phone: string | null;
};

function AdminUsers() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: roles, error } = await supabase.from("user_roles").select("user_id, role");
      if (error) throw error;
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone");
      const byUser = new Map<string, UserRow>();
      for (const r of roles ?? []) {
        const profile = profiles?.find((p) => p.id === r.user_id);
        byUser.set(r.user_id, {
          user_id: r.user_id,
          role: r.role as AppRole,
          name: profile?.full_name ?? `User ${r.user_id.slice(0, 8)}`,
          phone: profile?.phone ?? null,
        });
      }
      return [...byUser.values()].sort((a, b) => a.name.localeCompare(b.name));
    },
  });

  const setRole = async (userId: string, role: AppRole, displayName: string) => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: role as "admin" | "user" | "super_admin" | "vendor",
    });
    if (error) return toast.error(error.message);

    if (role === "vendor") {
      const { data: existing } = await supabase.from("vendors").select("id").eq("user_id", userId).maybeSingle();
      if (!existing) {
        const shop = `${displayName} Store`;
        const { error: vErr } = await supabase.from("vendors").insert({
          user_id: userId,
          shop_name: shop,
          slug: `${slugifyShop(shop)}-${userId.slice(0, 6)}`,
        });
        if (vErr) toast.error(`Role set; vendor shop failed: ${vErr.message}`);
      }
    }

    toast.success(`Role updated to ${ROLE_CATALOG[role].label}`);
    refetch();
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Users & Roles"
        description="Super admin only — assign platform roles and provision vendor shops."
        actions={<RoleBadge role="super_admin" />}
      />

      <SectionCard title="Role access matrix">
        <RoleAccessGrid compact />
      </SectionCard>

      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Registered users
        </h2>
        <ResponsiveScroll>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">User</th>
                <th className="p-3 font-medium">User ID</th>
                <th className="p-3 font-medium">Current role</th>
                <th className="p-3 font-medium">Assign role</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Loading users…
                  </td>
                </tr>
              )}
              {data?.map((u) => (
                <tr key={u.user_id} className="border-t hover:bg-muted/20">
                  <td className="p-3">
                    <div className="font-medium">{u.name}</div>
                    {u.phone && <div className="text-xs text-muted-foreground">{u.phone}</div>}
                  </td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">{u.user_id.slice(0, 12)}…</td>
                  <td className="p-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="p-3">
                    <Select value={u.role} onValueChange={(v) => setRole(u.user_id, v as AppRole, u.name)}>
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["user", "vendor", "admin", "super_admin"] as AppRole[]).map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_CATALOG[r].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
              {!isLoading && !data?.length && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No users in user_roles yet. Sign up at /auth to create the first super admin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ResponsiveScroll>
      </div>
    </div>
  );
}
