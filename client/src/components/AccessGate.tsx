import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";

interface AccessGateProps {
  /** Content to show (blurred when locked) */
  children: React.ReactNode;
  /** Number of items to show before locking. Default: 1 */
  previewCount?: number;
  /** Custom message shown on the gate overlay */
  message?: string;
  /** Extra classes on the wrapper */
  className?: string;
}

/**
 * Wraps content with a blur/lock overlay for logged-out users.
 * Shows `previewCount` items clearly, then blurs the rest.
 * Authenticated users see everything without any overlay.
 */
export function AccessGate({ children, previewCount = 1, message, className }: AccessGateProps) {
  const { isAuthenticated, loading } = useAuth();

  // While auth state is loading, render children normally (no flash)
  if (loading) return <>{children}</>;

  // Authenticated users see everything
  if (isAuthenticated) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      {/* Blurred content */}
      <div className="blur-[3px] select-none pointer-events-none opacity-60">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="bg-background/90 backdrop-blur-md border border-border rounded-2xl px-6 py-5 shadow-2xl flex flex-col items-center gap-3 max-w-xs text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Sign in to unlock</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {message ?? `Create a free account to access the full content.`}
            </p>
          </div>
          <Button
            size="sm"
            className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={() => { window.location.href = getLoginUrl(); }}
          >
            Get started free
          </Button>
        </div>
      </div>
    </div>
  );
}
