import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/types/commerce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Cpu, ShieldCheck, Crown, Eye, EyeOff, Loader2 } from "lucide-react";
import { RoleAccessGrid } from "@/components/dashboard/RoleAccessGrid";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign In — NexusIoT" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
    tab: typeof s.tab === "string" ? s.tab : undefined,
  }),
  component: Auth,
});

/** Maps Supabase error messages to friendly copy */
function friendlyError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid email or password"))
    return "Incorrect email or password. Double-check and try again.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email first — check your inbox for the verification link.";
  if (m.includes("user already registered"))
    return "An account with this email already exists. Use Sign In instead.";
  if (m.includes("password should be at least"))
    return "Password must be at least 6 characters.";
  if (m.includes("rate limit"))
    return "Too many attempts — wait a minute and try again.";
  return msg;
}

function Auth() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const defaultTab = search.tab === "signup" ? "signup" : "signin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  /** Reads roles from DB and sends user to correct dashboard */
  const redirectAfterAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate({ to: "/" }); return; }

    if (search.redirect) {
      navigate({ to: search.redirect as "/" }); return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);
    const list = (roles ?? []).map((r) => r.role as AppRole);

    if (list.includes("super_admin") || list.includes("admin")) {
      navigate({ to: "/admin" }); return;
    }
    if (list.includes("vendor")) {
      navigate({ to: "/vendor" }); return;
    }
    navigate({ to: "/account" });
  };

  const signIn = async () => {
    if (!email.trim() || !password) return toast.error("Enter your email and password");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setBusy(false);
    if (error) return toast.error(friendlyError(error.message));
    toast.success("Signed in successfully");
    await redirectAfterAuth();
  };

  const signUp = async () => {
    if (!email.trim()) return toast.error("Enter your email address");
    if (!password) return toast.error("Choose a password");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: name.trim() },
      },
    });
    setBusy(false);
    if (error) return toast.error(friendlyError(error.message));

    if (data.session) {
      // Email confirm is OFF — user is signed in immediately
      toast.success("Account created — welcome!");
      await redirectAfterAuth();
    } else {
      // Email confirm is ON
      toast.success("Account created! Check your email for a confirmation link.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") signIn();
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] grid lg:grid-cols-2">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-center px-12 text-white"
        style={{ background: "var(--gradient-hero)" }}
      >
        <Cpu className="h-12 w-12 text-primary mb-6" />
        <h2 className="text-3xl font-bold tracking-tight">Welcome to NexusIoT</h2>
        <p className="mt-3 text-slate-200 max-w-md leading-relaxed">
          Pakistan's professional IoT commerce platform. Sign in to manage products, track orders, and access your workspace.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-slate-300">
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            Secure Supabase authentication
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            Role-based access: super_admin, admin, vendor, customer
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            Password reset via email link
          </li>
        </ul>
        <div className="mt-8 max-h-[min(50vh,380px)] overflow-y-auto pr-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Platform roles</p>
          <RoleAccessGrid compact className="opacity-90" />
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 justify-center mb-8 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
              <Cpu className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">NexusIoT</span>
          </div>

          <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-[var(--shadow-elevated)]">
            <Tabs defaultValue={defaultTab}>
              <TabsList className="grid grid-cols-2 w-full h-11">
                <TabsTrigger value="signin" className="min-h-[40px]">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="min-h-[40px]">Sign Up</TabsTrigger>
              </TabsList>

              {/* ─── Sign In ─── */}
              <TabsContent value="signin" className="space-y-4 mt-6">
                <div className="space-y-1.5">
                  <Label htmlFor="si-email">Email</Label>
                  <Input
                    id="si-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="si-pw">Password</Label>
                    <Link
                      to="/auth/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="si-pw"
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button onClick={signIn} disabled={busy} className="w-full min-h-[48px] text-base">
                  {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in…</> : "Sign In"}
                </Button>

                <div className="border-t pt-4 space-y-2">
                  <p className="text-xs text-muted-foreground text-center">
                    Need admin access but stuck as customer?
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/setup">
                      <Crown className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                      Activate super admin
                    </Link>
                  </Button>
                </div>
              </TabsContent>

              {/* ─── Sign Up ─── */}
              <TabsContent value="signup" className="space-y-4 mt-6">
                <div className="space-y-1.5">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input
                    id="su-name"
                    autoComplete="name"
                    placeholder="Muhammad Huzaifa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-email">Email</Label>
                  <Input
                    id="su-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-pw">Password</Label>
                  <div className="relative">
                    <Input
                      id="su-pw"
                      type={showPw ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button onClick={signUp} disabled={busy} className="w-full min-h-[48px] text-base">
                  {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account…</> : "Create Account"}
                </Button>
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  The first registered user automatically becomes <strong>super admin</strong>.
                </p>
                <div className="border-t pt-3">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/setup">
                      <Crown className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                      Already signed up? Activate super admin
                    </Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By signing in you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
