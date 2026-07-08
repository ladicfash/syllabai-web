import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Returns the name to show in the UI, preferring the user's saved
 * Settings > Display Name over the raw OAuth login name (which never
 * changes and previously was the only name shown anywhere in the app).
 */
export function useDisplayName(): string {
  const { user, isAuthenticated } = useAuth();
  const { data: settings } = trpc.settings.get.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
  return (settings?.displayName || user?.name || "").trim();
}
