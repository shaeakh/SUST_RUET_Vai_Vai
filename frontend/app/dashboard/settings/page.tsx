"use client";

export default function DashboardSettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences. (Placeholder)
        </p>
      </header>
      <div className="rounded-xl border border-border bg-card p-6 shadow-md">
        <p className="text-sm text-muted-foreground">
          Settings options will appear here once configured.
        </p>
      </div>
    </div>
  );
}
