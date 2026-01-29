"use client";

import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

interface NavbarProps {
  userName?: string;
  showAuthLinks?: boolean;
  showDashboardLinks?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName,
  showAuthLinks = true,
  showDashboardLinks = false,
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
  };

  const displayName = userName ?? user?.full_name;

  return (
    <header className="w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-tight sm:text-lg"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
            VV
          </span>
          <span className="hidden sm:inline-block">VaiVai Dashboard</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {showDashboardLinks && displayName && (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-sm text-muted-foreground">
                Hi, {displayName}
              </span>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          )}

          {showAuthLinks && (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary sm:text-sm"
              >
                Login
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground shadow-sm transition-all hover:border-primary hover:text-primary sm:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="h-[2px] w-4 rounded bg-current" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border/60 bg-background px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-2">
            {showDashboardLinks && displayName && (
              <div className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm">
                <span className="font-medium">{displayName}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Logout
                </button>
              </div>
            )}

            {showAuthLinks && (
              <>
                <Link
                  href="/login"
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === "/login"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === "/register"
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/90 text-primary-foreground hover:bg-primary"
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
