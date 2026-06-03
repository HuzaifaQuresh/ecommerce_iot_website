/**
 * /setup — One-time super admin promotion.
 * Only works when:
 *   1. The user is signed in
 *   2. There are ZERO super_admins in the system yet
 * Once a super_admin exists this page redirects to /admin.
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Crown, CheckCircle2, ShieldAlert, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/setup")({
  head: () => ({ meta: [{ title: "Platform Setup — NexusIoT" }] }),
  component: Setup,
});

function Setup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"checking" | "ready" | "done" | "already" | "noauth">("checking");
  const [userEmail, setUserEmail] = useState("");
  const [busy, setBusy] = useState(false);

  // Check state on mount
  useState(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStep("noauth"); return; }
      setUserEmail(session.user.email ?? "");

      // Check if any super_admin already exists
      const { data: existing } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "super_admin")
        .limit(1);

      if (existing && existing.length > 0) {
        setStep("already");
      } else {
        setStep("ready");
      }
    })();
  });

  const promote = async () => {
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Not signed in"); return; }

      // Remove any existing role for this user
      await supabase.from("user_roles").delete().eq("user_id", session.user.id);

      // Grant super_admin
      const { error } = await supabase.from("user_roles").insert({
        user_id: session.user.id,
        role: "super_admin",
      });

      if (error) throw error;
      setStep("done");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed — run SQL manually");
    } finally {
      setBusy(false);
    }
  };

  if (step === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (step === "noauth") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border bg-card p-8 text-center shadow-lg">
          <ShieldAlert className="h-14 w-14 mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold">Sign in first</h1>
          <p className="text-muted-foreground mt-2">
            You need to be signed in before you can become super admin.
          </p>
          <Button asChild className="mt-6 w-full min-h-[48px]">
            <Link to="/auth">Go to Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (step === "already") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border bg-card p-8 text-center shadow-lg">
          <CheckCircle2 className="h-14 w-14 mx-auto text-emerald-500 mb-4" />
          <h1 className="text-2xl font-bold">Super admin already exists</h1>
          <p className="text-muted-foreground mt-2">
            A super admin account is already configured. Sign in with that account or contact your super admin to assign you a role.
          </p>
          <div className="flex flex-col gap-3 mt-6">
            <Button asChild className="w-full min-h-[48px]">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin">Try Admin Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border bg-card p-8 text-center shadow-lg">
          <Crown className="h-16 w-16 mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold">Super Admin activated!</h1>
          <p className="text-muted-foreground mt-2">
            <span className="font-medium text-foreground">{userEmail}</span> is now super admin.
          </p>
          <div className="mt-6 rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-sm text-left space-y-1">
            <p className="font-semibold text-amber-700">What you can do now:</p>
            <p>• Full product, order and voucher management</p>
            <p>• Analytics and site settings</p>
            <p>• Assign roles to other users</p>
          </div>
          <Button
            className="mt-6 w-full min-h-[48px]"
            onClick={() => navigate({ to: "/admin" })}
          >
            Open Admin Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // step === "ready"
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border bg-card p-8 shadow-lg">
        <div className="flex justify-center mb-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/15">
            <Crown className="h-8 w-8 text-amber-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center">One-time platform setup</h1>
        <p className="text-muted-foreground text-center mt-2 text-sm">
          No super admin exists yet. Promote your current account to get full access.
        </p>

        <div className="mt-6 rounded-xl bg-muted/50 border p-4 text-sm space-y-2">
          <p className="text-muted-foreground">Signed in as:</p>
          <p className="font-semibold text-foreground break-all">{userEmail}</p>
          <p className="text-xs text-muted-foreground pt-1">
            This account will receive the <strong>super_admin</strong> role — full platform control.
          </p>
        </div>

        <Button
          className="w-full mt-6 min-h-[52px] text-base"
          onClick={promote}
          disabled={busy}
        >
          {busy ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Activating…</>
          ) : (
            <><Crown className="h-4 w-4 mr-2" /> Make me Super Admin</>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          This page disappears once a super admin exists.
          Sign in first if you haven't already.
        </p>
      </div>
    </div>
  );
}
