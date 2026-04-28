"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, LoaderCircle, QrCode, ScanLine } from "lucide-react";
import { RoleGuard } from "@/components/layout/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";
import { useEventMetricsQuery } from "@/hooks/queries/use-event-operations-query";
import { getRequestErrorMessage } from "@/lib/utils";

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

type BarcodeDetectorCtor = new (options: { formats: string[] }) => BarcodeDetectorLike;

type ScanResponse = {
  status: "valid" | "used" | "invalid";
  ticket: {
    id: string;
    ticketCode: string;
    ticketTypeName: string;
    attendeeName: string;
    attendeeEmail: string;
    checkedInAt?: string | null;
    orderReference: string;
  } | null;
};

export default function EventScannerPage({ params }: { params: { id: string } }) {
  const { data: metrics } = useEventMetricsQuery(params.id);
  const { scanEventTicket, checkInEventTicket } = useAppMutations();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const runDetectionLoop = async () => {
    const video = videoRef.current;
    const Detector = (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
    if (!video || !Detector) {
      return;
    }

    const detector = new Detector({ formats: ["qr_code"] });

    const tick = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        rafRef.current = requestAnimationFrame(() => {
          void tick();
        });
        return;
      }

      try {
        const results = await detector.detect(videoRef.current);
        const firstValue = results[0]?.rawValue;
        if (firstValue) {
          const response = await scanEventTicket.mutateAsync({
            eventId: params.id,
            qrToken: firstValue
          });
          setScanResult(response.data);
          setManualToken(firstValue);
          return;
        }
      } catch {
        // keep scanning quietly while camera is active
      }

      rafRef.current = requestAnimationFrame(() => {
        void tick();
      });
    };

    await tick();
  };

  const startCamera = async () => {
    setScannerError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment"
        }
      });

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
      void runDetectionLoop();
    } catch (error) {
      setScannerError(getRequestErrorMessage(error, "We could not open the camera on this device."));
    }
  };

  return (
    <RoleGuard roles={["organizer", "admin"]}>
      <DashboardShell
        title="Scanner"
        subtitle="Scan QR tickets live, validate them instantly, and check guests in without touching finance data."
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="surface-panel p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Live QR scanning</p>
                <p className="mt-2 text-sm leading-7 text-muted">Use the device camera when available, or paste a token or verification URL manually.</p>
              </div>
              <Button variant="pill" className="bg-[#ff5a1f] hover:bg-[#e64d16]" onClick={() => void startCamera()}>
                <Camera className="h-4 w-4" />
                Start camera
              </Button>
            </div>

            <div className="mt-5 overflow-hidden rounded-[22px] border border-line bg-[#160d21]">
              <div className="flex aspect-[1.4] items-center justify-center">
                <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
                {!cameraReady ? (
                  <div className="absolute flex flex-col items-center gap-3 text-white/85">
                    <ScanLine className="h-8 w-8" />
                    <p className="text-sm">Camera preview appears here after permission is granted.</p>
                  </div>
                ) : null}
              </div>
            </div>

            <form
              className="mt-5 flex flex-col gap-3 sm:flex-row"
              onSubmit={async (event) => {
                event.preventDefault();
                setScannerError(null);

                try {
                  const response = await scanEventTicket.mutateAsync({
                    eventId: params.id,
                    qrToken: manualToken
                  });
                  setScanResult(response.data);
                } catch (error) {
                  setScannerError(getRequestErrorMessage(error, "We could not validate that ticket right now."));
                }
              }}
            >
              <Input
                value={manualToken}
                onChange={(event) => setManualToken(event.target.value)}
                placeholder="Paste a QR token or verification URL"
              />
              <Button type="submit" variant="secondary" disabled={scanEventTicket.isPending}>
                {scanEventTicket.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                Validate
              </Button>
            </form>

            {scannerError ? (
              <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-[#f0ccd2] bg-[#fff6f7] px-4 py-3 text-sm text-[#923647]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{scannerError}</p>
              </div>
            ) : null}

            {scanResult ? (
              <div className="mt-5 rounded-[18px] border border-line bg-surface-subtle p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Last scan</p>
                    <p className="mt-1 text-xs leading-6 text-muted">EventChimp reads raw tokens or full verification links.</p>
                  </div>
                  <Badge tone={scanResult.status === "valid" ? "success" : scanResult.status === "used" ? "warning" : "default"}>
                    {scanResult.status}
                  </Badge>
                </div>

                {scanResult.ticket ? (
                  <div className="mt-4 space-y-2 text-sm text-muted">
                    <p><span className="font-semibold text-ink">Guest:</span> {scanResult.ticket.attendeeName}</p>
                    <p><span className="font-semibold text-ink">Email:</span> {scanResult.ticket.attendeeEmail}</p>
                    <p><span className="font-semibold text-ink">Ticket code:</span> {scanResult.ticket.ticketCode}</p>
                    <p><span className="font-semibold text-ink">Tier:</span> {scanResult.ticket.ticketTypeName}</p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted">No valid ticket was found for that scan.</p>
                )}

                <Button
                  className="mt-5 bg-[#ff5a1f] hover:bg-[#e64d16]"
                  variant="pill"
                  disabled={scanResult.status !== "valid" || checkInEventTicket.isPending}
                  onClick={async () => {
                    try {
                      await checkInEventTicket.mutateAsync({
                        eventId: params.id,
                        qrToken: manualToken
                      });
                      const refreshed = await scanEventTicket.mutateAsync({
                        eventId: params.id,
                        qrToken: manualToken
                      });
                      setScanResult(refreshed.data);
                    } catch (error) {
                      setScannerError(getRequestErrorMessage(error, "We could not complete the check-in."));
                    }
                  }}
                >
                  {checkInEventTicket.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  Check in attendee
                </Button>
              </div>
            ) : null}
          </section>

          <aside className="space-y-5">
            <section className="surface-panel p-5 md:p-6">
              <p className="text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Scanner stats</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[16px] bg-surface-subtle px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Tickets sold</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{metrics?.totalTicketsSold ?? 0}</p>
                </div>
                <div className="rounded-[16px] bg-surface-subtle px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Checked in</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{metrics?.checkIns ?? 0}</p>
                </div>
                <div className="rounded-[16px] bg-surface-subtle px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Remaining guests</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{metrics?.remainingGuests ?? 0}</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
