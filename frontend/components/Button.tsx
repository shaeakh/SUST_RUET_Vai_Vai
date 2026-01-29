import { cn } from "@/lib/utils";
import * as React from "react";

type ButtonVariant = "default" | "outline" | "ghost" | "subtle";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const baseClasses =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg",
  outline:
    "border border-primary bg-background text-primary shadow-sm hover:bg-primary/5 hover:shadow-md",
  ghost:
    "text-foreground hover:bg-muted hover:text-foreground border border-transparent",
  subtle:
    "bg-muted text-foreground shadow-sm hover:bg-muted/80 hover:shadow-md",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-11 px-6",
  icon: "h-9 w-9",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
