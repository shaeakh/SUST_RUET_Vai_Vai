import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar */}
      <header className="w-full border-b border-border/60">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
              VV
            </span>
            <span className="hidden sm:inline-block">VaiVai Dashboard</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary hover:text-primary hover:shadow-md"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-center space-y-6">
            <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
              Smart analytics for growing teams
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Stay ahead with a{" "}
              <span className="text-primary">real‑time dashboard</span> for your
              platform.
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
              Monitor users, engagement, and growth in one clean interface. Sign
              up to start tracking your product health in seconds—no complex
              setup required.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg sm:w-auto"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-md border border-primary bg-background px-6 py-2.5 text-sm font-semibold text-primary shadow-sm transition-all hover:bg-primary/5 hover:shadow-md sm:w-auto"
              >
                Sign In
              </Link>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required. Get instant access to your personal
              dashboard.
            </p>
          </div>

          {/* Feature cards */}
          <div className="mt-12 grid w-full gap-6 md:grid-cols-3">
            <div className="group rounded-lg border border-border bg-card p-5 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <span className="text-lg font-semibold">01</span>
              </div>
              <h3 className="text-sm font-semibold">Realtime overview</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Track key metrics like active users, engagement, and growth
                without leaving your dashboard.
              </p>
            </div>

            <div className="group rounded-lg border border-border bg-card p-5 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <span className="text-lg font-semibold">02</span>
              </div>
              <h3 className="text-sm font-semibold">Simple access control</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Roles like User, Admin, and Moderator make it easy to manage who
                can see what.
              </p>
            </div>

            <div className="group rounded-lg border border-border bg-card p-5 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <span className="text-lg font-semibold">03</span>
              </div>
              <h3 className="text-sm font-semibold">Designed for focus</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                A clean, minimal interface with smooth interactions that stays
                out of your way.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <span>
            © {new Date().getFullYear()} VaiVai Dashboard. All rights reserved.
          </span>
          <span className="hidden sm:inline-block">
            Built with Next.js & Tailwind CSS.
          </span>
        </div>
      </footer>
    </div>
  );
}
