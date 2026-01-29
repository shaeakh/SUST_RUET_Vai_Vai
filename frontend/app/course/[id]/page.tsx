"use client";

import { Button } from "@/components/Button";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";

interface User {
  name: string;
  email: string;
  role: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("vai-vai-user");
    if (!stored) {
      router.replace("/login");
      return;
    }
    try {
      setUser(JSON.parse(stored) as User);
    } catch {
      window.localStorage.removeItem("vai-vai-user");
      router.replace("/login");
      return;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Loading course...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar userName={user.name} showAuthLinks={false} showDashboardLinks />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-6 shadow-md">
          <h1 className="text-xl font-semibold tracking-tight">
            Course: {id || "Unknown"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This is a placeholder. Connect your backend to load course content,
            modules, and resources.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/courses">
              <Button variant="subtle" size="sm">
                My Courses
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
