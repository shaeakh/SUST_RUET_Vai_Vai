"use client";

import { cn } from "@/lib/utils";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  FolderIcon,
  LayoutIcon,
  SettingsIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutIcon },
  { href: "/dashboard/courses", label: "My Courses", icon: FolderIcon },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border bg-card text-card-foreground shadow-sm transition-[width] duration-200 ease-in-out md:flex",
        collapsed ? "w-14" : "w-48",
      )}
      aria-label="Dashboard navigation"
    >
      <div
        className={cn(
          "flex flex-col gap-1 border-b border-border p-3",
          collapsed && "items-center",
        )}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                collapsed ? "justify-center px-2" : "justify-between",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              title={collapsed ? label : undefined}
              aria-current={isActive ? "page" : undefined}
            >
              <HugeiconsIcon
                icon={Icon}
                strokeWidth={2}
                className="size-4 shrink-0"
              />
              {!collapsed && <span>{label}</span>}
              {!collapsed && isActive && (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className={cn(
          "mt-auto flex items-center gap-2 border-t border-border p-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          collapsed ? "justify-center" : "justify-between",
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
      >
        <HugeiconsIcon
          icon={collapsed ? ArrowRight01Icon : ArrowLeft01Icon}
          strokeWidth={2}
          className="size-4 shrink-0"
        />
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}
