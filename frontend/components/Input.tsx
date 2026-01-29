import { cn } from "@/lib/utils";
import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-all",
            error && "border-red-500 focus-visible:ring-red-500",
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-red-600">{error}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
