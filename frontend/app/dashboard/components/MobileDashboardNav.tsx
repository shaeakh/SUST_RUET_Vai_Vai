"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/courses", label: "My Courses" },
  { href: "/dashboard/settings", label: "Settings" },
] as const;

export function MobileDashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex border-b border-border bg-card px-4 py-2 md:hidden"
      aria-label="Dashboard navigation"
    >
      <div className="flex gap-1">
        {links.map(({ href, label }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
