import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/types/commerce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Cpu, ShieldCheck } from "lucide-react";
import { RoleAccessGrid } from "@/components/dashboard/RoleAccessGrid";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign In — NexusIoT" }] }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const redirectAfterAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate({ to: "/" });
      return;
    }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
    const list = (roles ?? []).map((r) => r.role as AppRole);
    if (list.includes("super_admin") || list.includes("admin")) {
      navigate({ to: "/admin" });
      return;
    }
    if (list.includes("vendor")) {
      navigate({ to: "/vendor" });
      return;
    }
    navigate({ to: "/" });
  };

  const signIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in");
    await redirectAfterAuth();
  };
  const signUp = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — please check your email to confirm");
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] grid lg:grid-cols-2">
      <div
        className="hidden lg:flex flex-col justify-center px-12 text-white"
        style={{ background: "var(--gradient-hero)" }}
      >
        <Cpu className="h-12 w-12 text-primary mb-6" />
        <h2 className="text-3xl font-bold tracking-tight">Welcome to NexusIoT</h2>
        <p className="mt-3 text-slate-200 max-w-md leading-relaxed">
          Sign in to track orders, manage your profile, and access vendor or admin dashboards when assigned.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-slate-300">
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Secure Supabase authentication
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> First account becomes super admin
          </li>
        </ul>
        <div className="mt-8 max-h-[min(50vh,420px)] overflow-y-auto pr-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Platform roles</p>
          <RoleAccessGrid compact className="opacity-95" />
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 sm:p-8 shadow-[var(--shadow-elevated)]">
          <div className="flex items-center gap-2 justify-center mb-6 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
              <Cpu className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">NexusIoT</span>
          </div>
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full h-11">
              <TabsTrigger value="signin" className="min-h-[40px]">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="min-h-[40px]">
                Sign Up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button onClick={signIn} disabled={busy} className="w-full min-h-[48px]">
                {busy ? "Signing in…" : "Sign In"}
              </Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input id="signup-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button onClick={signUp} disabled={busy} className="w-full min-h-[48px]">
                {busy ? "Creating…" : "Create Account"}
              </Button>
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                First registered user becomes super admin. Sign in at /auth, then open Admin from the account menu.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
