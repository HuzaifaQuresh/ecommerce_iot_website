import { Link } from "@tanstack/react-router";
import { Cpu, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { CATEGORIES } from "@/lib/format";

const SHOP_CATS = CATEGORIES.slice(0, 7);

const COMPANY_LINKS = [
  { to: "/iot-solutions", label: "Enterprise Solutions" },
  { to: "/products", label: "Product Catalog" },
  { to: "/iot-solutions", label: "Request a Quote" },
  { to: "/auth", label: "Sign In / Sign Up" },
  { to: "/account/orders", label: "Order Tracking" },
];

const SUPPORT_LINKS = [
  { label: "EasyPaisa / JazzCash payment" },
  { label: "Bank transfer orders" },
  { label: "Bulk & B2B pricing" },
  { label: "Warranty & returns" },
  { label: "Technical support" },
];

export function Footer() {
  return (
    <footer className="mt-12 sm:mt-20 bg-[color:var(--ink)] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-14 pb-8 grid gap-8 sm:gap-10 grid-cols-2 lg:grid-cols-5">

        {/* Brand */}
        <div className="col-span-2 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground shrink-0">
              <Cpu className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">NexusIoT</span>
          </div>
          <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
            Pakistan's premier IoT automation platform — from a single Tuya sensor to complete
            enterprise deployments across telecom, industrial, and smart home sectors.
          </p>

          {/* Contact */}
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <a href="mailto:sales@nexusiot.pk" className="hover:text-primary transition-colors">
                sales@nexusiot.pk
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <a href="tel:+923001234567" className="hover:text-primary transition-colors">
                +92 300 1234567
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>Lahore, Punjab, Pakistan</span>
            </li>
          </ul>

          {/* Social */}
          <div className="flex gap-3 pt-1">
            {[
              { Icon: Facebook, href: "#", label: "Facebook" },
              { Icon: Instagram, href: "#", label: "Instagram" },
              { Icon: Linkedin, href: "#", label: "LinkedIn" },
              { Icon: Youtube, href: "#", label: "YouTube" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 hover:bg-primary hover:text-white transition-colors text-slate-400"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Shop categories */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            {SHOP_CATS.map((c) => (
              <li key={c}>
                <Link
                  to="/products"
                  search={{ category: c } as never}
                  className="hover:text-primary transition-colors block"
                >
                  {c}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/products" className="text-primary font-medium hover:underline">
                View all →
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Company</h4>
          <ul className="space-y-2.5 text-sm">
            {COMPANY_LINKS.map(({ to, label }) => (
              <li key={label}>
                <Link to={to} className="hover:text-primary transition-colors block">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Support</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            {SUPPORT_LINKS.map(({ label }) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
          <div className="mt-5 p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
            <p className="text-xs font-semibold text-white">Business hours</p>
            <p className="text-xs text-slate-400">Mon–Sat: 9 AM – 6 PM PKT</p>
            <p className="text-xs text-slate-400">Sun: Closed</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-2 sm:justify-between text-xs text-slate-500">
          <span>© {new Date().getFullYear()} NexusIoT. All rights reserved. · Lahore, Pakistan</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>PKR pricing</span>
            <span>GST inclusive</span>
            <span>Secure checkout</span>
            <span>Pan-Pakistan shipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
