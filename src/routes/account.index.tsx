import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/site/PageLayout";
import { RoleAccessGrid } from "@/components/dashboard/RoleAccessGrid";
import { primaryRole, ROLE_CATALOG } from "@/lib/roles";
import { toast } from "sonner";
import { Shield, Mail, Phone, User } from "lucide-react";

export const Route = createFileRoute("/account/")({ component: AccountProfile });

function AccountProfile() {
  const { user, roles } = useAuth();
  const primary = primaryRole(roles.length ? roles : ["user"]);
  const meta = ROLE_CATALOG[primary];

  const { data, refetch } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: String(fd.get("name")), phone: String(fd.get("phone")) })
      .eq("id", user!.id);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    refetch();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Profile details">
        <form onSubmit={save} className="space-y-4 max-w-lg">
          <div>
            <Label className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
            </Label>
            <Input value={user?.email ?? ""} disabled className="mt-1.5" />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground" /> Full name
            </Label>
            <Input name="name" defaultValue={data?.full_name ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone
            </Label>
            <Input name="phone" defaultValue={data?.phone ?? ""} placeholder="+92 300 1234567" className="mt-1.5" />
          </div>
          <Button type="submit" className="min-h-[44px]">
            Save profile
          </Button>
        </form>
      </SectionCard>

      <SectionCard title="Your role on NexusIoT">
        <div className="flex items-start gap-3 mb-4 p-4 rounded-lg bg-muted/40 border">
          <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{meta.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{meta.description}</p>
          </div>
        </div>
        <RoleAccessGrid compact highlight={primary} />
        <p className="text-xs text-muted-foreground mt-4">
          Need vendor or admin access? Contact your platform super admin or sign up first on a fresh project.
        </p>
      </SectionCard>
    </div>
  );
}
