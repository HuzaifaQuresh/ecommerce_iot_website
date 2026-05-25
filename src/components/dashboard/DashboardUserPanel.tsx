import { Link } from "@tanstack/react-router";
import type { AppRole } from "@/types/commerce";
import { dashboardLinks } from "@/lib/roles";
import { RoleBadge } from "@/components/dashboard/RoleBadge";
import { cn } from "@/lib/utils";

export function DashboardUserPanel({
  email,
  roles,
  className,
}: {
  email?: string | null;
  roles: AppRole[];
  className?: string;
}) {
  const links = dashboardLinks(roles);

  return (
    <div className={cn("mt-auto pt-5 border-t border-white/10", className)}>
      {email && <p className="text-xs text-slate-400 truncate mb-2">{email}</p>}
      {roles.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {roles.map((r) => (
            <RoleBadge key={r} role={r} size="sm" />
          ))}
        </div>
      )}
      <div className="flex flex-col gap-1">
        {links
          .filter((l) => !l.to.startsWith("/account"))
          .map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-xs text-slate-400 hover:text-white transition-colors truncate"
            >
              → {l.label}
            </Link>
          ))}
      </div>
    </div>
  );
}
