"use client";

import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";
import * as React from "react";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { MobileDashboardNav } from "./components/MobileDashboardNav";

interface User {
  name: string;
  email: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
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
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar userName={user.name} showAuthLinks={false} showDashboardLinks />
      <div className="flex">
        <DashboardSidebar />
        <main className="min-h-[calc(100vh-4rem)] flex-1 overflow-auto">
          <MobileDashboardNav />
          {children}
        </main>
      </div>
    </div>
  );
}
