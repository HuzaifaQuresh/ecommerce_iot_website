import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/api/products";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import { ProductCard, type Product } from "@/components/site/ProductCard";
import { CATEGORIES } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Cpu,
  Home,
  Radio,
  Wifi,
  Factory,
  Zap,
  Bot,
  ArrowRight,
  ShieldCheck,
  Truck,
  Headset,
  Printer,
  Wrench,
  CircuitBoard,
  Layers,
  Building2,
  Plug,
  Gauge,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const CAT_ICONS: Record<string, LucideIcon> = {
  "3D Printers": Printer,
  Components: Cpu,
  "Development Boards": CircuitBoard,
  "Engineering Services": Layers,
  "Industrial Automation": Factory,
  "PCB Assembly Line": Layers,
  "Phoenix Contact": Plug,
  "Power Modules": Zap,
  Robotics: Bot,
  Sensors: Gauge,
  "Smart Home": Home,
  "Smart Boards": CircuitBoard,
  Tools: Wrench,
  "Custom Boards": Cpu,
  "Consumer Electronics": Radio,
  Printers: Printer,
  "Personal Safety": ShieldCheck,
  Motherboard: CircuitBoard,
};

function Index() {
  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      try {
        const data = await fetchProducts();
        const list = (data as Product[]).filter((p) => p.availability === "in_stock");
        if (list.length) return [...list].sort((a, b) => b.discount_pct - a.discount_pct).slice(0, 8);
      } catch {
        /* mock */
      }
      return [...MOCK_PRODUCTS]
        .filter((p) => p.availability === "in_stock")
        .sort((a, b) => b.discount_pct - a.discount_pct)
        .slice(0, 8) as Product[];
    },
  });

  const homeCategories = CATEGORIES.slice(0, 8);

  return (
    <>
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20 lg:py-28 grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          <div className="text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-medium ring-1 ring-white/20">
              <Camera className="h-3 w-3" /> Tuya • Hikvision • Espressif • Siemens
            </span>
            <h1 className="mt-4 sm:mt-5 text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight">
              IoT Hardware & <span className="text-primary">Enterprise</span> Automation
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-200 max-w-xl">
              From a single Tuya sensor to a complete telecom tower surveillance deployment — sourced,
              configured and shipped across Pakistan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 min-h-[48px]">
                <Link to="/products">
                  Shop Catalog <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/5 text-white border-white/30 hover:bg-white/10 hover:text-white min-h-[48px]"
              >
                <Link to="/iot-solutions">Enterprise IoT Solutions</Link>
              </Button>
            </div>
            <dl className="mt-8 sm:mt-10 grid grid-cols-3 gap-4 sm:gap-6 max-w-md">
              {[
                ["1.2K+", "SKUs in stock"],
                ["50+", "Deployments"],
                ["24/7", "Support"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="text-2xl font-bold text-primary">{n}</dt>
                  <dd className="text-xs text-slate-300">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative mt-4 lg:mt-0">
            <div className="aspect-[4/3] sm:aspect-square max-w-md mx-auto lg:max-w-none rounded-2xl bg-gradient-to-br from-primary/20 to-transparent ring-1 ring-white/10 backdrop-blur p-4 sm:p-6 grid grid-cols-2 gap-3 sm:gap-4">
              {[Camera, Wifi, Home, Radio].map((Icon, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/5 ring-1 ring-white/10 grid place-items-center backdrop-blur min-h-[80px] sm:min-h-0"
                >
                  <Icon className="h-10 w-10 sm:h-16 sm:w-16 text-primary" strokeWidth={1.2} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 sm:py-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
          {[
            [ShieldCheck, "1-Year Warranty"],
            [Truck, "Pan-Pakistan Shipping"],
            [Headset, "Engineering Support"],
            [Cpu, "Bulk & B2B Pricing"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof Cpu;
            return (
              <div key={label as string} className="flex items-center gap-2 text-muted-foreground">
                <I className="h-5 w-5 text-primary shrink-0" />
                <span className="font-medium text-foreground">{label as string}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Shop by Category</h2>
            <p className="text-muted-foreground mt-1">Browse by department and subcategory.</p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link to="/products">View all departments →</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {homeCategories.map((c) => {
            const Icon = CAT_ICONS[c] ?? Cpu;
            return (
              <Link
                key={c}
                to="/products"
                search={{ category: c } as never}
                className="group flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-4 sm:p-6 hover:border-primary hover:shadow-[var(--shadow-card)] transition min-h-[120px]"
              >
                <div className="grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-center leading-snug">{c}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12 sm:pb-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Featured Deals</h2>
            <p className="text-muted-foreground mt-1">Top discounts across IoT hardware.</p>
          </div>
          <Button asChild variant="ghost" className="w-fit">
            <Link to="/products">View all →</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {featured?.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20">
        <div
          className="rounded-2xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="relative max-w-2xl">
            <h3 className="text-2xl lg:text-3xl font-bold">Need a Custom Enterprise Deployment?</h3>
            <p className="mt-3 text-slate-200 text-sm sm:text-base leading-relaxed">
              Telecom tower surveillance, fire-alarm cloud systems, TV-studio automation — we engineer
              end-to-end IoT solutions tailored to your site.
            </p>
            <Button asChild size="lg" className="mt-6 bg-primary hover:bg-primary/90 min-h-[48px]">
              <Link to="/iot-solutions">
                Explore Solutions <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
