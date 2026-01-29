"use client";

import * as React from "react";
import { DashboardCoursesView } from "./components/DashboardCoursesView";

interface User {
  name: string;
  email: string;
  role: string;
}

function useUser(): User | null {
  const [user, setUser] = React.useState<User | null>(null);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("vai-vai-user");
      if (stored) setUser(JSON.parse(stored) as User);
    } catch {
      /* ignore */
    }
  }, []);
  return user;
}

export default function DashboardPage() {
  const user = useUser();
  const firstName = user?.name?.split(" ")[0] || user?.name || "there";

  return (
    <DashboardCoursesView
      title={`Welcome back, ${firstName}!`}
      subtitle="Here's a quick overview of your courses. Create one or open any card to continue."
    />
  );
}
