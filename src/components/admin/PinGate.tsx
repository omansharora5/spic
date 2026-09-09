import { useState, type FormEvent } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { api } from "@/services/api";
import { ADMIN_PIN } from "@/services/firebaseEvents";
import { Alert, Button, Field, Input } from "@/components/ui/kit";
import { MeshBackdrop, GridField } from "@/components/site/Atmosphere";

export const PIN_STORAGE_KEY = "spic_admin_pin";

export function readStoredPin(): string | null {
  try {
    return sessionStorage.getItem(PIN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function persistPin(pin: string) {
  try {
    sessionStorage.setItem(PIN_STORAGE_KEY, pin);
  } catch {
    /* storage unavailable (private mode) — session only */
  }
}

export function clearStoredPin() {
  try {
    sessionStorage.removeItem(PIN_STORAGE_KEY);
  } catch {
    /* no-op */
  }
}

/**
 * Shared access gate for SPIC operational tools (admin console, ticket scanner).
 * Verifies against the backend when reachable, falling back to the client PIN.
 */
export default function PinGate({
  title,
  description,
  onAuthenticated,
}: {
  title: string;
  description: string;
  onAuthenticated: (pin: string) => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api.verifyAdminPin(pin.trim());
      if (!res.success) throw new Error(res.message || "Invalid PIN");
      persistPin(pin.trim());
      onAuthenticated(pin.trim());
    } catch (err) {
      // Production fails closed: the server must approve the PIN.
      // Local dev (`npm run dev`) falls back to VITE_ADMIN_PIN from .env
      // so you can work without any backend running.
      const devPin = import.meta.env.DEV ? ADMIN_PIN : "";
      if (devPin && pin.trim() === devPin) {
        persistPin(pin.trim());
        onAuthenticated(pin.trim());
      } else {
        setError((err as Error).message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-[78vh] items-center justify-center overflow-hidden px-5 py-16">
      <MeshBackdrop variant="light" className="opacity-80" />
      <GridField />

      <form
        onSubmit={submit}
        className="edge-gradient relative w-full max-w-md rounded-[28px] bg-surface p-9 shadow-[var(--shadow-xl)]"
      >
        <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-gradient-to-br from-[#E6F4FF] to-[#D2EBFF] text-brand shadow-[var(--shadow-inset)]">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-display text-[26px] leading-tight font-semibold tracking-[-0.035em] text-ink">
          {title}
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">{description}</p>

        <div className="mt-6 space-y-4">
          {error ? <Alert tone="error">{error}</Alert> : null}
          <Field label="Access PIN" required>
            <Input
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="••••••••"
              autoFocus
              autoComplete="current-password"
              aria-label="Access PIN"
            />
          </Field>
          <Button type="submit" size="lg" className="w-full" disabled={busy || !pin.trim()}>
            {busy ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Unlock
          </Button>
        </div>
      </form>
    </div>
  );
}
