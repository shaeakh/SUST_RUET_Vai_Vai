import { cn } from "@/lib/utils";
import * as React from "react";

interface StatCardProps {
  label: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  description,
  icon,
}) => {
  return (
    <div className="group rounded-lg border border-border bg-card p-5 shadow-md transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        {icon ? (
          <div
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary",
              "transition-colors group-hover:bg-primary group-hover:text-primary-foreground",
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>
      {description ? (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
};
