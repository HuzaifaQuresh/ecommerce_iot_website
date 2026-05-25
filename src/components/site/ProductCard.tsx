import { Link } from "@tanstack/react-router";
import { ShoppingCart, Star } from "lucide-react";
import { fmtPKR, AVAILABILITY_LABEL } from "@/lib/format";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { optimizeProductImageUrl } from "@/lib/product-image";

export type Product = {
  id: string;
  title: string;
  slug: string;
  price_pkr: number;
  image_url: string | null;
  category: string;
  manufacturer: string | null;
  discount_pct: number;
  availability: string;
  rating: number | null;
  stock: number;
};

export function ProductCard({ p, view = "grid" }: { p: Product; view?: "grid" | "list" }) {
  const { add } = useCart();
  const original = p.discount_pct > 0 ? p.price_pkr / (1 - p.discount_pct / 100) : null;
  const inStock = p.availability === "in_stock" && p.stock > 0;
  const detailTo = "/products/$slug" as const;

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) {
      toast.error("Item not available");
      return;
    }
    add({ id: p.id, title: p.title, price_pkr: p.price_pkr, image_url: p.image_url, slug: p.slug });
    toast.success("Added to cart");
  };

  if (view === "list") {
    return (
      <div className="flex gap-4 p-4 rounded-lg border bg-card hover:shadow-[var(--shadow-card)] transition group">
        <Link
          to={detailTo}
          params={{ slug: p.slug }}
          className="relative h-32 w-32 sm:h-36 sm:w-36 shrink-0 rounded-md bg-muted overflow-hidden block"
        >
          <img
            src={optimizeProductImageUrl(p.image_url, "card")}
            alt={p.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover group-hover:scale-105 transition"
          />
          {p.discount_pct > 0 && (
            <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
              -{p.discount_pct}%
            </span>
          )}
        </Link>
        <div className="flex-1 min-w-0 flex flex-col">
          <Link to={detailTo} params={{ slug: p.slug }} className="block flex-1 min-w-0">
            <div className="text-xs text-muted-foreground">{p.manufacturer} • {p.category}</div>
            <h3 className="font-semibold mt-1 line-clamp-2 hover:text-primary">{p.title}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
              <Star className="h-3 w-3 fill-current" /> {p.rating}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">{fmtPKR(p.price_pkr)}</span>
              {original && (
                <span className="text-xs text-muted-foreground line-through">{fmtPKR(Math.round(original))}</span>
              )}
            </div>
          </Link>
          <div className="mt-2 flex items-center justify-between">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${inStock ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}
            >
              {AVAILABILITY_LABEL[p.availability]}
            </span>
            <Button size="sm" onClick={onAdd} disabled={!inStock}>
              <ShoppingCart className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="group flex flex-col rounded-lg border bg-card overflow-hidden hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition">
      <Link to={detailTo} params={{ slug: p.slug }} className="block relative aspect-square bg-muted overflow-hidden">
        <img
          src={optimizeProductImageUrl(p.image_url, "card")}
          alt={p.title}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition duration-500"
        />
        {p.discount_pct > 0 && (
          <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
            -{p.discount_pct}%
          </span>
        )}
        {!inStock && (
          <span className="absolute top-2 right-2 bg-slate-900/85 text-white text-[10px] font-medium px-2 py-1 rounded">
            {AVAILABILITY_LABEL[p.availability]}
          </span>
        )}
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <Link to={detailTo} params={{ slug: p.slug }} className="block flex-1">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{p.manufacturer}</div>
          <h3 className="text-sm font-semibold mt-1 line-clamp-2 min-h-10 hover:text-primary">{p.title}</h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-muted-foreground">{p.rating}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-bold text-primary">{fmtPKR(p.price_pkr)}</span>
            {original && (
              <span className="text-xs text-muted-foreground line-through">{fmtPKR(Math.round(original))}</span>
            )}
          </div>
        </Link>
        <Button size="sm" className="mt-3 w-full" onClick={onAdd} disabled={!inStock}>
          <ShoppingCart className="h-4 w-4 mr-1" /> Add to cart
        </Button>
      </div>
    </article>
  );
}
