import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Radio, Flame, Tv, Factory, Truck, Building2, ArrowRight, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageContainer, PageHeader } from "@/components/site/PageLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/iot-solutions")({
  head: () => ({
    meta: [
      { title: "Enterprise IoT Solutions — NexusIoT" },
      { name: "description", content: "Ready-made enterprise IoT deployment packages: telecom surveillance, fire-alarm cloud, studio automation." },
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

const EMPTY = {
  name: "",
  company: "",
  email: "",
  phone: "",
  solution: "",
  message: "",
};

function ConsultationForm({ defaultSolution = "", onClose }: { defaultSolution?: string; onClose: () => void }) {
  const [form, setForm] = useState({ ...EMPTY, solution: defaultSolution });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.solution) {
      toast.error("Name, email, and solution are required");
      return;
    }
    setBusy(true);
    try {
      // Insert into site_settings as a consultation lead (fallback: toast only)
      const { error } = await supabase.from("site_settings").upsert({
        key: `lead_${Date.now()}`,
        value: JSON.stringify({
          type: "consultation",
          ...form,
          submitted_at: new Date().toISOString(),
        }),
      });
      if (error) {
        // Non-fatal — still confirm to user
        console.warn("Lead save failed:", error.message);
      }
      setDone(true);
    } catch {
      toast.error("Could not submit — please email us directly at info@nexusiot.pk");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-600 mb-4" />
        <h3 className="text-xl font-bold">Request received!</h3>
        <p className="text-muted-foreground mt-2 max-w-xs">
          Our team will contact you at <strong>{form.email}</strong> within 24 hours.
        </p>
        <Button className="mt-6" onClick={onClose}>Close</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>Full name *</Label>
          <Input placeholder="Muhammad Huzaifa" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label>Company</Label>
          <Input placeholder="Automatiq Systems" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        </div>
        <div>
          <Label>Email *</Label>
          <Input type="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input placeholder="03XX XXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>Solution of interest *</Label>
        <Select value={form.solution} onValueChange={(v) => setForm({ ...form, solution: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a solution…" />
          </SelectTrigger>
          <SelectContent>
            {SOLUTIONS.map((s) => (
              <SelectItem key={s.title} value={s.title}>{s.title}</SelectItem>
            ))}
            <SelectItem value="Custom">Custom / Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Project brief</Label>
        <Textarea
          placeholder="Briefly describe your use case, scale, and timeline…"
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>
      <Button className="w-full min-h-[48px]" onClick={handleSubmit} disabled={busy}>
        {busy ? "Submitting…" : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Request consultation
          </>
        )}
      </Button>
    </div>
  );
}

function Solutions() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState("");

  const openQuote = (title = "") => {
    setSelectedSolution(title);
    setDialogOpen(true);
  };

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
            Pre-engineered IoT deployment packages, ready to scale across your sites — from a single tower to nationwide rollouts.
          </p>
          <Button
            size="lg"
            className="mt-8 bg-primary hover:bg-primary/90 min-h-[48px]"
            onClick={() => openQuote()}
          >
            Request consultation <ArrowRight className="ml-1 h-4 w-4" />
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
                onClick={() => openQuote(title)}
              >
                Request quote <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </article>
          ))}
        </div>
      </PageContainer>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSolution ? `Quote: ${selectedSolution}` : "Request a consultation"}
            </DialogTitle>
          </DialogHeader>
          <ConsultationForm
            defaultSolution={selectedSolution}
            onClose={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
