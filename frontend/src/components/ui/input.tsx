import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-[14px] border border-transparent bg-[#f3f2f6] px-4 text-sm text-ink outline-none transition",
        "placeholder:text-[#b2abba] focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/8",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
