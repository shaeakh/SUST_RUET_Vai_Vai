"use client";

import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import * as React from "react";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { MobileDashboardNav } from "./components/MobileDashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar
          userName={user?.full_name}
          showAuthLinks={false}
          showDashboardLinks
        />
        <div className="flex">
          <DashboardSidebar />
          <main className="min-h-[calc(100vh-4rem)] flex-1 overflow-auto">
            <MobileDashboardNav />
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
