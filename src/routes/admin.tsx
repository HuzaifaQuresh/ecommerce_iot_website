import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { LayoutDashboard, Package, ShoppingBag, Settings, Ticket, BarChart3, Users } from "lucide-react";
import type { AppRole } from "@/types/commerce";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
    const list = (roles ?? []).map((r) => r.role as AppRole);
    const ok = list.some((r) => r === "admin" || r === "super_admin");
    if (!ok) throw redirect({ to: "/" });
    const isSuper = list.includes("super_admin");
    return {
      isSuper,
      roles: list,
      email: session.user.email,
    };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { isSuper, roles, email } = Route.useRouteContext();
  const nav: NavItem[] = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { to: "/admin/vouchers", label: "Vouchers", icon: Ticket },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];
  if (isSuper) nav.push({ to: "/admin/users", label: "Users & Roles", icon: Users });

  return (
    <DashboardShell
      title={isSuper ? "Super Admin" : "Platform Admin"}
      subtitle={isSuper ? "Full platform control" : "Catalog, orders & storefront ops"}
      nav={nav}
      userEmail={email}
      userRoles={roles}
    >
      <Outlet />
    </DashboardShell>
  );
}
