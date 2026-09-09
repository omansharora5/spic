import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, CameraOff, CircleCheck, CircleAlert, ImageUp, LoaderCircle, LogOut, QrCode, RotateCcw } from "lucide-react";
import { api, type VerifyPayload, type VerifyResult } from "@/services/api";
import { updateFirebaseCheckIn, verifyTicketDirect } from "@/services/firebaseRegistrations";
import PinGate, { clearStoredPin, readStoredPin } from "@/components/admin/PinGate";
import { Alert, Badge, Button, EmptyState, buttonStyles } from "@/components/ui/kit";

const SCANNER_ELEMENT_ID = "spic-qr-reader";

interface ScanEntry {
  id: string;
  name: string;
  time: string;
  status: "approved" | "rejected";
  message: string;
}

export default function Scanner() {
  const [pin, setPin] = useState<string | null>(() => readStoredPin());
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [history, setHistory] = useState<ScanEntry[]>([]);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const verifyingRef = useRef(false);

  const destroyScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setScanning(false);
    if (scanner) {
      try {
        if (scanner.isScanning) await scanner.stop();
        scanner.clear();
      } catch {
        /* ignore clean-up errors */
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      void destroyScanner();
    };
  }, [destroyScanner]);

  /** Verify a scanned payload: API first, Firestore as the resilient fallback. */
  const verify = useCallback(
    async (data: string) => {
      if (verifyingRef.current) return;
      verifyingRef.current = true;
      await destroyScanner();

      setError("");
      setResult(null);
      setLoading(true);

      try {
        let parsed: VerifyPayload & { isTeam?: boolean; memberIndex?: number };
        try {
          parsed = JSON.parse(String(data).trim());
        } catch {
          throw new Error("Invalid QR format. Please scan an official SPIC ticket QR.");
        }

        if (!parsed.registrationId || !parsed.eventId || !parsed.verificationToken) {
          throw new Error("Missing ticket credentials in QR. Please scan a valid ticket.");
        }

        let res: VerifyResult;
        try {
          res = await api.verify(parsed);
          updateFirebaseCheckIn(parsed.registrationId, Boolean(parsed.isTeam), parsed.memberIndex).catch(
            (fbErr: Error) => console.warn("[Scanner] Firestore check-in note:", fbErr.message),
          );
        } catch (apiError) {
          console.warn("[Scanner] API verify unavailable, verifying via Firestore:", (apiError as Error).message);
          res = await verifyTicketDirect(parsed);
        }

        if (!res.valid) throw new Error(res.error || "Ticket could not be verified.");

        setResult(res);
        setHistory((prev) => [
          {
            id: Math.random().toString(36).slice(2, 7),
            name: res.participantName || "Participant",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            status: "approved",
            message: res.attendance || "Attendance marked present",
          },
          ...prev.slice(0, 19),
        ]);
      } catch (err) {
        const message = (err as Error).message;
        setError(message);
        setHistory((prev) => [
          {
            id: Math.random().toString(36).slice(2, 7),
            name: "Invalid ticket",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            status: "rejected",
            message,
          },
          ...prev.slice(0, 19),
        ]);
      } finally {
        setLoading(false);
        verifyingRef.current = false;
      }
    },
    [destroyScanner],
  );

  const startScanner = useCallback(async () => {
    setCameraError("");
    setError("");
    setResult(null);

    try {
      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 12, qrbox: { width: 260, height: 260 }, aspectRatio: 1 },
        (decoded) => void verify(decoded),
        () => undefined,
      );
      setScanning(true);
    } catch (err) {
      scannerRef.current = null;
      setScanning(false);
      setCameraError(
        (err as Error)?.message ||
          "Camera access was denied. Allow camera permission in your browser, or upload a ticket image instead.",
      );
    }
  }, [verify]);

  const scanFromFile = useCallback(
    async (file: File) => {
      setCameraError("");
      setLoading(true);
      const holderId = "spic-qr-file-reader";
      try {
        const fileScanner = new Html5Qrcode(holderId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        const decoded = await fileScanner.scanFile(file, true);
        await fileScanner.clear();
        setLoading(false);
        await verify(decoded);
      } catch (err) {
        setLoading(false);
        setError((err as Error)?.message || "No QR code found in that image.");
      }
    },
    [verify],
  );

  const reset = () => {
    setResult(null);
    setError("");
    void startScanner();
  };

  if (!pin) {
    return (
      <PinGate
        title="Ticket scanner"
        description="This tool is restricted to SPIC organisers. Enter the operations PIN to verify tickets."
        onAuthenticated={setPin}
      />
    );
  }

  return (
    <div className="shell py-10 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="eyebrow">
            <span className="inline-block h-px w-6 bg-brand/45" aria-hidden />
            Operations
          </p>
          <h1 className="mt-2 font-display text-[clamp(1.9rem,4vw,2.8rem)] leading-tight font-semibold tracking-[-0.035em] text-ink">
            Ticket scanner
          </h1>
          <p className="mt-2 max-w-xl text-[14.5px] text-muted">
            Scan a participant's QR ticket to verify and mark attendance at the venue entrance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={scanning ? "green" : "neutral"}>{scanning ? "Camera live" : "Camera idle"}</Badge>
          <button
            type="button"
            onClick={() => {
              void destroyScanner();
              clearStoredPin();
              setPin(null);
            }}
            className={buttonStyles("outline", "sm")}
          >
            <LogOut className="h-3.5 w-3.5" /> Lock
          </button>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Camera panel */}
        <section className="rounded-[26px] border border-line bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <div className="grain-overlay relative aspect-square w-full overflow-hidden rounded-[20px] bg-abyss shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div id={SCANNER_ELEMENT_ID} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />
            <div id="spic-qr-file-reader" className="hidden" />

            {!scanning ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/70">
                <QrCode className="h-10 w-10" />
                <p className="max-w-xs px-6 text-center text-[13.5px]">
                  Start the camera to scan tickets, or upload a screenshot of a ticket.
                </p>
              </div>
            ) : (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-56 w-56 rounded-[22px] border-2 border-white/70">
                  <span className="absolute -top-px -left-px h-8 w-8 rounded-tl-[20px] border-t-4 border-l-4 border-ember" />
                  <span className="absolute -top-px -right-px h-8 w-8 rounded-tr-[20px] border-t-4 border-r-4 border-ember" />
                  <span className="absolute -bottom-px -left-px h-8 w-8 rounded-bl-[20px] border-b-4 border-l-4 border-ember" />
                  <span className="absolute -right-px -bottom-px h-8 w-8 rounded-br-[20px] border-r-4 border-b-4 border-ember" />
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {scanning ? (
              <Button variant="outline" onClick={() => void destroyScanner()} className="flex-1">
                <CameraOff className="h-4 w-4" /> Stop camera
              </Button>
            ) : (
              <Button onClick={() => void startScanner()} className="flex-1">
                <Camera className="h-4 w-4" /> Start camera
              </Button>
            )}

            <label className="flex-1">
              <span className="sr-only">Upload ticket image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void scanFromFile(file);
                  event.target.value = "";
                }}
              />
              <span className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-line-strong bg-surface px-5 text-sm font-semibold text-ink transition hover:border-brand hover:bg-mist">
                <ImageUp className="h-4 w-4" /> Upload ticket
              </span>
            </label>
          </div>

          {cameraError ? (
            <div className="mt-4">
              <Alert tone="warn" title="Camera unavailable">
                {cameraError}
              </Alert>
            </div>
          ) : null}
        </section>

        {/* Result panel */}
        <section className="space-y-5">
          <div className="rounded-[24px] border border-line bg-surface p-6">
            <h2 className="text-[12px] font-bold tracking-[0.2em] text-muted uppercase">Verification result</h2>

            {loading ? (
              <div className="mt-6 flex items-center gap-3 text-muted">
                <LoaderCircle className="h-5 w-5 animate-spin text-brand" /> Verifying ticket…
              </div>
            ) : result ? (
              <div className="mt-5">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-[#E9F9F0] text-[#0F7A46]">
                  <CircleCheck className="h-7 w-7" />
                </span>
                <p className="mt-4 font-display text-[22px] font-semibold text-ink">{result.participantName}</p>
                <p className="text-[13.5px] text-muted">{result.participantEmail}</p>
                <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[13.5px]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Event</dt>
                    <dd className="font-medium text-ink">{result.eventName}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Attendance</dt>
                    <dd className="font-medium text-[#0F7A46]">{result.attendance ?? "Marked present"}</dd>
                  </div>
                </dl>
                <Button variant="subtle" className="mt-5 w-full" onClick={reset}>
                  <RotateCcw className="h-4 w-4" /> Scan next ticket
                </Button>
              </div>
            ) : error ? (
              <div className="mt-5">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-[#FEF2F2] text-[#B42318]">
                  <CircleAlert className="h-7 w-7" />
                </span>
                <p className="mt-4 font-display text-[19px] font-semibold text-ink">Ticket rejected</p>
                <p className="mt-1 text-[13.5px] text-muted">{error}</p>
                <Button variant="subtle" className="mt-5 w-full" onClick={reset}>
                  <RotateCcw className="h-4 w-4" /> Try again
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-[14px] text-muted">Scan a ticket to see participant details here.</p>
            )}
          </div>

          <div className="rounded-[24px] border border-line bg-surface p-6">
            <h2 className="text-[12px] font-bold tracking-[0.2em] text-muted uppercase">Session log</h2>
            {history.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="No scans yet" description="Verified tickets from this session appear here." />
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {history.map((entry) => (
                  <li key={entry.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-ink">{entry.name}</p>
                      <p className="truncate text-[12.5px] text-muted">{entry.message}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge tone={entry.status === "approved" ? "green" : "ember"}>{entry.status}</Badge>
                      <p className="mt-1 text-[11.5px] text-muted tabular-nums">{entry.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
