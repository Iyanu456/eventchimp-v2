import { cn } from "@/lib/utils";

export function LoadingCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "surface-panel animate-pulse bg-[linear-gradient(90deg,#ffffff_0%,#faf8fd_48%,#ffffff_100%)]",
        className
      )}
    />
  );
}
