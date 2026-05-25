import { createFileRoute, Link } from "@tanstack/react-router";
import { Radio, Flame, Tv, Factory, Truck, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/site/PageLayout";

export const Route = createFileRoute("/iot-solutions")({
  head: () => ({
    meta: [
      { title: "Enterprise IoT Solutions — NexusIoT" },
      {
        name: "description",
        content:
          "Ready-made enterprise IoT deployment packages: telecom surveillance, fire-alarm cloud, studio automation.",
      },
    ],
  }),
  component: Solutions,
});

const SOLUTIONS = [
  {
    icon: Radio,
    title: "Remote Telecom Tower Surveillance",
    desc: "4G/LoRa-backed PTZ + intrusion + power monitoring across unmanned tower sites.",
    tags: ["PTZ", "LoRaWAN", "Power Sensors"],
  },
  {
    icon: Flame,
    title: "Integrated Fire Alarm & Smoke Cloud",
    desc: "Tuya smoke + heat + gas sensors aggregated to a real-time cloud dashboard with SMS escalation.",
    tags: ["Tuya", "Cloud", "SMS Alerts"],
  },
  {
    icon: Tv,
    title: "TV Studio Environment Automation",
    desc: "Lighting, HVAC, on-air signage and AV switching unified under one panel.",
    tags: ["DMX", "Zigbee", "HMI"],
  },
  {
    icon: Factory,
    title: "Industrial SCADA & PLC Integration",
    desc: "Siemens / Weintek stacks integrated with custom dashboards and edge gateways.",
    tags: ["PLC", "SCADA", "Modbus"],
  },
  {
    icon: Truck,
    title: "Fleet & Cold-Chain Telemetry",
    desc: "GPS + temperature loggers with geofencing and tamper alerts.",
    tags: ["GPS", "Telemetry"],
  },
  {
    icon: Building2,
    title: "Smart Office & Access Control",
    desc: "RFID/biometric access, occupancy and energy analytics for commercial buildings.",
    tags: ["Access", "Analytics"],
  },
];

function Solutions() {
  return (
    <>
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:py-20 text-white">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary/90 mb-3">
            Enterprise
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl">
            Enterprise IoT Solutions
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
            Pre-engineered IoT deployment packages, ready to scale across your sites — from a single tower to
            nationwide rollouts.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 min-h-[48px]">
            <Link to="/auth">
              Request consultation <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <PageContainer>
        <PageHeader
          title="Solution packages"
          description="Industry-standard architectures with documented SLAs and local engineering support."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {SOLUTIONS.map(({ icon: Icon, title, desc, tags }) => (
            <article
              key={title}
              className="group rounded-xl border bg-card p-5 sm:p-6 hover:shadow-[var(--shadow-elevated)] hover:border-primary/30 transition flex flex-col"
            >
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-lg leading-snug">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{desc}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span key={t} className="text-[11px] bg-muted px-2 py-0.5 rounded-full font-medium">
                    {t}
                  </span>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 px-0 w-fit text-primary hover:bg-transparent"
                asChild
              >
                <Link to="/auth">
                  Request quote <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </PageContainer>
    </>
  );
}
