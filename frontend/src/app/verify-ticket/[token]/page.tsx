import Link from "next/link";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyTicketPage() {
  return (
    <div className="page-shell py-16">
      <div className="surface-panel mx-auto max-w-2xl px-6 py-8 text-center sm:px-10 sm:py-12">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1eb] text-[#ff5a1f]">
          <QrCode className="h-6 w-6" />
        </span>
        <h1 className="font-display mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] text-ink">Ticket verification link detected</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted">
          This QR code is designed for EventChimp’s scanner workspace. An organizer, manager, or scanner can validate it from their event dashboard.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/login">
            <Button variant="pill" className="bg-[#ff5a1f] hover:bg-[#e64d16]">Open scanner workspace</Button>
          </Link>
          <Link href="/events">
            <Button variant="secondary">Browse events</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
