import { Link } from "@tanstack/react-router";
import { Cpu, Mail, Phone, MapPin } from "lucide-react";
import { CATEGORIES } from "@/lib/format";

export function Footer() {
  return (
    <footer className="mt-12 sm:mt-20 bg-[color:var(--ink)] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12 grid gap-8 sm:gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Cpu className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-white">NexusIoT</span>
          </div>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            Pakistan&apos;s premier hub for IoT automation, smart home and Tuya sensor solutions — for
            makers, integrators and enterprises.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Shop</h4>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.slice(0, 8).map((c) => (
              <li key={c}>
                <Link to="/products" search={{ category: c } as never} className="hover:text-primary transition-colors">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/iot-solutions" className="hover:text-primary transition-colors">
                Enterprise Solutions
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-primary transition-colors">
                Product Catalog
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-primary transition-colors">
                Sign In
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <a href="mailto:sales@nexusiot.pk" className="hover:text-primary transition-colors">
                sales@nexusiot.pk
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <a href="tel:+923001234567" className="hover:text-primary transition-colors">
                +92 300 1234567
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <span>Lahore, Pakistan</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-2 sm:justify-between text-xs text-slate-500">
          <span>© {new Date().getFullYear()} NexusIoT. All rights reserved.</span>
          <span className="text-slate-600">IoT commerce • PKR pricing • Secure checkout</span>
        </div>
      </div>
    </footer>
  );
}
