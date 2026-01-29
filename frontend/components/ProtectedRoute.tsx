"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, isAuthenticated, isAdmin } = useAuth();

  React.useEffect(() => {
    if (loading) return;

    const from =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : pathname;

    if (!isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(from)}`);
      return;
    }

    if (adminOnly && !isAdmin) {
      router.replace("/unauthorized");
    }
  }, [adminOnly, isAdmin, isAuthenticated, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Checking session…</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (adminOnly && !isAdmin) return null;

  return <>{children}</>;
}
