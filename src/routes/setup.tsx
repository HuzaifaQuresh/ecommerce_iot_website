/**
 * /setup — One-time super admin promotion.
 * Shows the direct SQL grant (always works) as the primary action,
 * and the one-click RPC as a secondary option after the migration is applied.
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Crown,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/setup")({
  head: () => ({ meta: [{ title: "Platform Setup — NexusIoT" }] }),
  component: Setup,
});

// ── tiny copy-to-clipboard helper ──────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setOk(true);
      setTimeout(() => setOk(false), 2500);
    });
  };
  return (
    <button
      onClick={copy}
      title="Copy SQL"
      className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 border hover:bg-background text-muted-foreground hover:text-foreground transition"
    >
      {ok
        ? <Check className="h-3.5 w-3.5 text-emerald-500" />
        : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function SqlBox({ sql }: { sql: string }) {
  return (
    <div className="relative rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 text-[11px] font-mono overflow-x-auto">
      <pre className="p-4 pr-10 whitespace-pre-wrap break-words leading-relaxed">{sql}</pre>
      <CopyBtn text={sql} />
    </div>
  );
}

// ── main component ──────────────────────────────────────────────
function Setup() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "noauth" | "already_admin" | "ready" | "done">("loading");
  const [rpcBusy, setRpcBusy] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkState = async () => {
    setChecking(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setStatus("noauth"); setChecking(false); return; }

    setUserEmail(session.user.email ?? null);
    setUserId(session.user.id);

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);
    const list = (roles ?? []).map((r: any) => r.role as string);

    if (list.includes("super_admin") || list.includes("admin")) {
      setStatus("already_admin");
    } else {
      setStatus("ready");
    }
    setChecking(false);
  };

  useEffect(() => { checkState(); }, []);

  // Try the RPC if the migration has been applied
  const tryRpc = async () => {
    setRpcBusy(true);
    try {
      const { data, error } = await supabase.rpc("bootstrap_super_admin");
      if (error) throw error;
      const result = data as { ok: boolean; error?: string } | null;
      if (result && !result.ok) throw new Error(result.error ?? "Failed");
      setStatus("done");
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg.includes("already exists")) {
        setStatus("already_admin");
      } else if (msg.includes("Could not find the function") || msg.includes("function") || msg.includes("42883")) {
        toast.error("Migration not applied yet — use the SQL method below.");
      } else {
        toast.error(msg);
      }
    } finally {
      setRpcBusy(false);
    }
  };

  // ── loading ────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── not signed in ──────────────────────────────────────────────
  if (status === "noauth") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full rounded-2xl border bg-card p-8 text-center shadow-lg space-y-4">
          <ShieldAlert className="h-14 w-14 mx-auto text-amber-500" />
          <h1 className="text-xl font-bold">Sign in first</h1>
          <p className="text-sm text-muted-foreground">
            You must be signed in to activate super admin.
          </p>
          <Button asChild className="w-full min-h-[48px]">
            <Link to="/auth">Go to Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── already admin ──────────────────────────────────────────────
  if (status === "already_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full rounded-2xl border bg-card p-8 text-center shadow-lg space-y-4">
          <CheckCircle2 className="h-14 w-14 mx-auto text-emerald-500" />
          <h1 className="text-xl font-bold">You already have admin access!</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as <strong className="text-foreground">{userEmail}</strong>.
          </p>
          <Button className="w-full min-h-[48px]" onClick={() => navigate({ to: "/admin" })}>
            Open Admin Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── success ────────────────────────────────────────────────────
  if (status === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full rounded-2xl border bg-card p-8 text-center shadow-lg space-y-4">
          <Crown className="h-16 w-16 mx-auto text-amber-500" />
          <h1 className="text-2xl font-bold">Super Admin activated!</h1>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{userEmail}</strong> now has full platform access.
          </p>
          <Button className="w-full min-h-[52px] text-base" onClick={() => navigate({ to: "/admin" })}>
            Open Admin Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── ready — main setup UI ──────────────────────────────────────
  const directSql = `-- Run this in Supabase SQL Editor
-- Replace email below if different from yours

DELETE FROM public.user_roles
  WHERE user_id = (
    SELECT id FROM auth.users WHERE email = '${userEmail}'
  );

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role
FROM auth.users
WHERE email = '${userEmail}';`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 mb-4">
            <Crown className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold">Activate Super Admin</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Signed in as <strong className="text-foreground">{userEmail}</strong>
          </p>
        </div>

        {/* ── METHOD 1: Direct SQL (always works) ── */}
        <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-white text-xs font-bold shrink-0">1</span>
            <h2 className="font-semibold">Fastest: Run SQL in Supabase (30 seconds)</h2>
          </div>

          <ol className="text-sm text-muted-foreground space-y-2 pl-8 list-decimal">
            <li>Click the <strong>Copy SQL</strong> button below</li>
            <li>
              Open{" "}
              <a
                href="https://supabase.com/dashboard/project/dypyvfuscpuzhrvrmebk/sql/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline inline-flex items-center gap-1"
              >
                Supabase SQL Editor <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>Paste the SQL and click <strong>Run</strong></li>
            <li>Come back here and click <strong>I've done it ✓</strong></li>
          </ol>

          <SqlBox sql={directSql} />

          <div className="flex gap-2 pt-1">
            <Button
              asChild
              variant="outline"
              className="flex-1"
            >
              <a
                href="https://supabase.com/dashboard/project/dypyvfuscpuzhrvrmebk/sql/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Open SQL Editor
              </a>
            </Button>
            <Button
              onClick={async () => {
                setChecking(true);
                await checkState();
              }}
              disabled={checking}
              className="flex-1"
            >
              {checking
                ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Checking…</>
                : <><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> I've done it ✓</>}
            </Button>
          </div>
        </div>

        {/* ── METHOD 2: One-click RPC ── */}
        <div className="rounded-2xl border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-muted-foreground text-xs font-bold shrink-0">2</span>
            <h2 className="font-semibold text-muted-foreground">One-click (requires migration applied first)</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            If you've already run{" "}
            <code className="bg-muted px-1 rounded text-foreground text-[11px]">20260603000000_bootstrap_super_admin.sql</code>,
            {" "}use this button:
          </p>
          <Button
            onClick={tryRpc}
            disabled={rpcBusy}
            variant="outline"
            className="w-full min-h-[44px]"
          >
            {rpcBusy
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Activating…</>
              : <><Crown className="h-4 w-4 mr-2 text-amber-500" /> Make me Super Admin (one-click)</>}
          </Button>
        </div>

        {/* Sign out link */}
        <p className="text-center text-xs text-muted-foreground">
          Wrong account?{" "}
          <button
            className="underline hover:text-primary"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
          >
            Sign out
          </button>
        </p>
      </div>
    </div>
  );
}
