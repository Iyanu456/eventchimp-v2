import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[148px] w-full rounded-[16px] border border-transparent bg-[#f3f2f6] px-4 py-3 text-sm text-ink outline-none transition",
      "placeholder:text-[#b2abba] focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/8",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
