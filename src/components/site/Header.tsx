import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Cpu,
  Search,
  ShoppingCart,
  User2,
  LogOut,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CategoryTreeNav } from "@/components/site/CategoryTreeNav";
import { CategoryNavBar } from "@/components/site/CategoryNavBar";
import { RoleBadge } from "@/components/dashboard/RoleBadge";

export function Header() {
  const { count, setDrawerOpen } = useCart();
  const { user, roles, isAdmin, isSuperAdmin, isVendor, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!path.startsWith("/products")) setQ("");
  }, [path]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/products", search: { q, category: undefined, sort: undefined } as never });
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[color:var(--ink)] text-white shadow-lg overflow-visible">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center gap-2 sm:gap-4">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white hover:bg-white/10 shrink-0"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs p-0 flex flex-col">
              <SheetHeader className="border-b px-4 py-4 text-left">
                <SheetTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  NexusIoT Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="flex-1 overflow-y-auto p-4 space-y-1 text-sm">
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-md hover:bg-muted font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-md hover:bg-muted font-medium"
                >
                  Shop All
                </Link>
                <Link
                  to="/iot-solutions"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-md hover:bg-muted font-medium"
                >
                  Enterprise IoT Solutions
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-md hover:bg-muted font-medium"
                >
                  Cart {count > 0 ? `(${count})` : ""}
                </Link>
                <p className="px-1 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Shop by category
                </p>
                <CategoryTreeNav />
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0">
            <div className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Cpu className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight truncate">
              Nexus<span className="text-primary">IoT</span>
            </span>
          </Link>

          <form onSubmit={submit} className="hidden md:flex flex-1 max-w-2xl min-w-0">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search cameras, sensors, gateways…"
                className="h-10 bg-white text-slate-900 pl-9 pr-24 border-0"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 bg-primary hover:bg-primary/90"
              >
                Search
              </Button>
            </div>
          </form>

          <nav className="hidden lg:flex items-center gap-1 text-sm ml-auto">
            <Link to="/iot-solutions" className="px-3 py-2 hover:text-primary transition rounded-md">
              IoT Solutions
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="relative hidden md:inline-flex items-center gap-2 rounded-md px-3 py-2 min-h-[44px] hover:bg-white/10"
            aria-label={`Cart, ${count} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden lg:inline text-sm">Cart</span>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary text-[10px] font-bold px-1">
                {count}
              </span>
            )}
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 hover:text-white shrink-0 min-h-[44px]"
                >
                  <User2 className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline max-w-[8rem] truncate">
                    {user.email?.split("@")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {roles.length > 0 && (
                  <div className="px-2 py-2 flex flex-wrap gap-1 border-b mb-1">
                    {roles.map((r) => (
                      <RoleBadge key={r} role={r} size="sm" />
                    ))}
                  </div>
                )}
                <DropdownMenuItem onClick={() => navigate({ to: "/account" })}>
                  <User2 className="h-4 w-4 mr-2" /> My Account
                </DropdownMenuItem>
                {isVendor && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/vendor" })}>
                    <LayoutDashboard className="h-4 w-4 mr-2" /> Vendor Dashboard
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {isSuperAdmin ? "Super Admin" : "Admin Dashboard"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" variant="secondary" className="hidden sm:inline-flex shrink-0">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>

        <form onSubmit={submit} className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="h-10 bg-white text-slate-900 pl-9 border-0 w-full"
            />
          </div>
        </form>
      </div>

      <CategoryNavBar />
    </header>
  );
}
