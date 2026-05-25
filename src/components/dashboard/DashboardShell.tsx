import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Menu, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DashboardUserPanel } from "@/components/dashboard/DashboardUserPanel";
import type { AppRole } from "@/types/commerce";
import { cn } from "@/lib/utils";

export type NavItem = { to: string; label: string; icon: LucideIcon; exact?: boolean };

function NavLinks({
  nav,
  path,
  onNavigate,
  vertical,
}: {
  nav: NavItem[];
  path: string;
  onNavigate?: () => void;
  vertical?: boolean;
}) {
  return (
    <nav className={cn(vertical ? "flex flex-col gap-1" : "flex gap-1 overflow-x-auto pb-1 scrollbar-thin")}>
      {nav.map((n) => {
        const active = n.exact ? path === n.to : path.startsWith(n.to);
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors min-h-[44px]",
              vertical ? "w-full" : "whitespace-nowrap shrink-0",
              active ? "bg-sky-500 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white",
            )}
          >
            <n.icon className="h-4 w-4 shrink-0" />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  title,
  subtitle,
  nav,
  backTo = "/",
  backLabel = "Back to site",
  userEmail,
  userRoles = [],
  children,
}: {
  title: string;
  subtitle?: string;
  nav: NavItem[];
  backTo?: string;
  backLabel?: string;
  userEmail?: string | null;
  userRoles?: AppRole[];
  children: React.ReactNode;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[minmax(0,240px)_1fr] bg-muted/30">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center gap-3 border-b bg-slate-950 text-white px-4 h-14 shrink-0">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" aria-label="Open dashboard menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs bg-slate-950 text-white border-slate-800 p-0">
            <SheetHeader className="border-b border-white/10 px-4 py-4 text-left">
              <SheetTitle className="text-white">{title}</SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <Link
                to={backTo}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 mb-4 text-sm text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> {backLabel}
              </Link>
              <NavLinks nav={nav} path={path} onNavigate={() => setOpen(false)} vertical />
              <DashboardUserPanel email={userEmail} roles={userRoles} className="px-4 pb-4" />
            </div>
          </SheetContent>
        </Sheet>
        <span className="font-semibold truncate flex-1">{title}</span>
        <Link to={backTo} className="text-xs text-slate-400 hover:text-white shrink-0">
          Exit
        </Link>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col bg-slate-950 text-white p-4 sticky top-0 h-screen shrink-0">
        <Link to={backTo} className="flex items-center gap-2 mb-6 text-sm text-slate-300 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Link>
        <div className="mb-6">
          <div className="font-bold text-lg tracking-tight">{title}</div>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <NavLinks nav={nav} path={path} vertical />
        <DashboardUserPanel email={userEmail} roles={userRoles} />
      </aside>

      {/* Tablet: horizontal nav under header area */}
      <div className="hidden md:flex lg:hidden bg-slate-950 text-white px-4 py-2 border-b border-white/10 shrink-0">
        <NavLinks nav={nav} path={path} />
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">{children}</main>
    </div>
  );
}
