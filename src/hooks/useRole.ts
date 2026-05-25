import { useAuth } from "./useAuth";
import type { AppRole } from "@/types/commerce";

export function useRole() {
  const { roles, isAdmin, isSuperAdmin, isVendor, loading } = useAuth();
  const has = (r: AppRole) => roles.includes(r);
  const canManagePlatform = isAdmin || isSuperAdmin;
  return { roles, has, isAdmin, isSuperAdmin, isVendor, canManagePlatform, loading };
}
