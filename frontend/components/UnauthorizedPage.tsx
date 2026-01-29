"use client";

import { Button } from "@/components/Button";
import Link from "next/link";

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-md">
        <h1 className="text-xl font-semibold tracking-tight">Unauthorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don’t have permission to access this page.
        </p>
        <div className="mt-6 flex gap-2">
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Sign in</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
