import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
  tone = "default"
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "subtle" | "accent" | "dark";
}) {
  return (
    <div
      className={cn(
        "rounded-[18px] border shadow-soft",
        tone === "default" && "border-line/90 bg-panel",
        tone === "subtle" && "border-line/90 bg-surface-subtle",
        tone === "accent" && "border-accent/10 bg-accent/5",
        tone === "dark" && "border-[#321040] bg-violet-strong text-white shadow-hero",
        className
      )}
    >
      {children}
    </div>
  );
}
