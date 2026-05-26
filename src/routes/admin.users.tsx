import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DashboardPageHeader, ResponsiveScroll, SectionCard } from "@/components/site/PageLayout";
import { RoleAccessGrid } from "@/components/dashboard/RoleAccessGrid";
import { RoleBadge } from "@/components/dashboard/RoleBadge";
import { WorkspaceBanner } from "@/components/dashboard/WorkspaceBanner";
import { ROLE_CATALOG, slugifyShop } from "@/lib/roles";
import { toast } from "sonner";
import type { AppRole } from "@/types/commerce";
import { Crown, Search, Users } from "lucide-react";

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
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<{ userId: string; role: AppRole; name: string } | null>(null);

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.user_id.toLowerCase().includes(q) ||
        u.role.includes(q) ||
        (u.phone?.toLowerCase().includes(q) ?? false),
    );
  }, [data, search]);

  const applyRole = async (userId: string, role: AppRole, displayName: string) => {
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
    <div className="space-y-6 sm:space-y-8">
      <WorkspaceBanner
        variant="super_admin"
        roles={["super_admin"]}
        title="Identity & Access Management"
        description="Assign platform roles and auto-provision vendor shops. Changes take effect on next sign-in."
        icon={Crown}
      />

      <DashboardPageHeader
        title="Users & Roles"
        description="Super admin only — manage who can access admin, vendor, and customer workspaces."
        actions={<RoleBadge role="super_admin" />}
      />

      <SectionCard title="Role access matrix">
        <RoleAccessGrid compact />
      </SectionCard>

      <SectionCard>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Registered users
            <span className="text-sm font-normal text-muted-foreground">({filtered.length})</span>
          </h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, ID, role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ResponsiveScroll>
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="p-3 font-semibold">User</th>
                <th className="p-3 font-semibold hidden md:table-cell">User ID</th>
                <th className="p-3 font-semibold">Role</th>
                <th className="p-3 font-semibold">Assign</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-muted-foreground">
                    Loading users…
                  </td>
                </tr>
              )}
              {filtered.map((u) => (
                <tr key={u.user_id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="font-medium">{u.name}</div>
                    {u.phone && <div className="text-xs text-muted-foreground">{u.phone}</div>}
                    <div className="md:hidden font-mono text-[10px] text-muted-foreground mt-1">{u.user_id.slice(0, 12)}…</div>
                  </td>
                  <td className="p-3 font-mono text-xs text-muted-foreground hidden md:table-cell">
                    {u.user_id.slice(0, 12)}…
                  </td>
                  <td className="p-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="p-3">
                    <Select
                      value={u.role}
                      onValueChange={(v) =>
                        setPending({ userId: u.user_id, role: v as AppRole, name: u.name })
                      }
                    >
                      <SelectTrigger className="w-full max-w-[11rem]">
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
              {!isLoading && !filtered.length && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-muted-foreground">
                    {search ? "No users match your search." : "No users yet. Sign up at /auth to create the first account."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ResponsiveScroll>
      </SectionCard>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm role change</AlertDialogTitle>
            <AlertDialogDescription>
              Assign <strong>{pending && ROLE_CATALOG[pending.role].label}</strong> to{" "}
              <strong>{pending?.name}</strong>?{" "}
              {pending?.role === "vendor" && "A vendor shop record will be created if missing."}
              {pending?.role === "super_admin" && "This grants full platform access including this page."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) applyRole(pending.userId, pending.role, pending.name);
                setPending(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
