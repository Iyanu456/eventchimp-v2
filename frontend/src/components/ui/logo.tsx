import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  tone = "dark"
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const isLight = tone === "light";

  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)}>
      <Image src="/Eventchimp Logo.svg" alt="EventChimp logo" width={36} height={28} />
      <span
        className={cn(
          "font-display text-[24px] font-semibold tracking-[-0.05em]",
          isLight ? "text-white" : "text-ink"
        )}
      >
        Event<span className="text-accent">Chimp</span>
      </span>
    </Link>
  );
}
