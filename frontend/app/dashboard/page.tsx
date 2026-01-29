"use client";

import { useAuth } from "@/hooks/useAuth";
import { DashboardCoursesView } from "./components/DashboardCoursesView";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardCoursesView
      title={`Welcome, ${user?.full_name ?? "there"}`}
      subtitle="Here's a quick overview of your courses. Create one or open any card to continue."
    />
  );
}
