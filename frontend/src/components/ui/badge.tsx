import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "default",
  className
}: {
  children: React.ReactNode;
  tone?: "default" | "accent" | "success" | "warning" | "danger";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.02em]",
        tone === "default" && "bg-[#f0eef4] text-[#726c7e]",
        tone === "accent" && "bg-accent/12 text-accent-deep",
        tone === "success" && "bg-success/12 text-success",
        tone === "warning" && "bg-warning/18 text-[#a9651e]",
        tone === "danger" && "bg-danger/12 text-danger",
        className
      )}
    >
      {children}
    </span>
  );
}
