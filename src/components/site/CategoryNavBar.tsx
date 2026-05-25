import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { CATEGORY_CATALOG, type CategoryNode } from "@/lib/categories";
import { cn } from "@/lib/utils";

const CLOSE_MS = 100;

function CategoryNavItem({ dept }: { dept: CategoryNode }) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const children = dept.children ?? [];
  const hasSubs = children.length > 0;

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ left: rect.left, top: rect.bottom });
  }, []);

  const show = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!hasSubs) return;
    updatePosition();
    setOpen(true);
  }, [hasSubs, updatePosition]);

  const hide = useCallback(() => {
    timer.current = setTimeout(() => setOpen(false), CLOSE_MS);
  }, []);

  const cancelHide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const dropdown =
    open &&
    hasSubs &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        className="fixed z-[100] pt-1"
        style={{ left: pos.left, top: pos.top }}
        onMouseEnter={cancelHide}
        onMouseLeave={hide}
      >
        <div
          className={cn(
            "rounded-lg border border-border bg-card text-foreground shadow-xl ring-1 ring-black/5 py-2 animate-in fade-in-0 zoom-in-95 duration-150",
            children.length > 8 ? "min-w-[280px] max-w-[320px]" : "min-w-[200px] max-w-[260px]",
          )}
        >
          <Link
            to="/products"
            search={{ category: dept.name } as never}
            className="block px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5 border-b border-border mb-1"
          >
            All {dept.name}
          </Link>
          <ul
            className={cn(
              "max-h-[min(70vh,360px)] overflow-y-auto scrollbar-thin px-1",
              children.length > 8 && "columns-2 gap-x-2",
            )}
          >
            {children.map((sub) => (
              <li key={sub} className="break-inside-avoid">
                <Link
                  to="/products"
                  search={{ category: sub } as never}
                  className="block rounded-md px-3 py-2 text-xs text-muted-foreground hover:text-primary hover:bg-muted transition"
                >
                  {sub}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      <div
        ref={triggerRef}
        className="relative shrink-0"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <Link
          to="/products"
          search={{ category: dept.name } as never}
          className={cn(
            "inline-flex items-center gap-1 px-3 h-10 text-xs font-medium whitespace-nowrap transition",
            open ? "text-white bg-white/10" : "text-slate-300 hover:text-white hover:bg-white/5",
          )}
        >
          {dept.name}
          {hasSubs && (
            <ChevronDown
              className={cn("h-3 w-3 opacity-70 transition-transform duration-200", open && "rotate-180")}
            />
          )}
        </Link>
      </div>
      {dropdown}
    </>
  );
}

export function CategoryNavBar() {
  return (
    <div className="hidden md:block border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-10 items-stretch gap-0.5 overflow-x-auto overflow-y-hidden scrollbar-none">
          <Link
            to="/products"
            search={{}}
            className="inline-flex items-center px-3 text-xs font-medium text-slate-400 hover:text-white whitespace-nowrap shrink-0 transition h-10"
          >
            All
          </Link>
          {CATEGORY_CATALOG.map((dept) => (
            <CategoryNavItem key={dept.name} dept={dept} />
          ))}
        </div>
      </div>
    </div>
  );
}
