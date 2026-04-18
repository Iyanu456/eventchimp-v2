import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "tertiary" | "destructive" | "pill" | "ghost";
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base"
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[#1f1730] text-white shadow-soft hover:bg-[#140d21] focus-visible:ring-4 focus-visible:ring-[#1f1730]/10",
  secondary:
    "border border-line bg-white text-ink shadow-soft hover:bg-[#faf8fd] focus-visible:ring-4 focus-visible:ring-accent/8",
  tertiary:
    "border border-transparent bg-surface text-ink hover:bg-[#ece8f3] focus-visible:ring-4 focus-visible:ring-accent/8",
  destructive:
    "bg-danger text-white shadow-soft hover:bg-[#9f1f15] focus-visible:ring-4 focus-visible:ring-danger/15",
  pill:
    "rounded-full bg-accent text-white shadow-halo hover:bg-accent-deep focus-visible:ring-4 focus-visible:ring-accent/20",
  ghost:
    "bg-transparent text-muted hover:bg-surface-subtle hover:text-ink focus-visible:ring-4 focus-visible:ring-accent/8"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        "focus-visible:outline-none",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
