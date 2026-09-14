import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleCheck, LoaderCircle, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { Event } from "@/data/events";
import { api, type Registration } from "@/services/api";
import { createRegistrationDirect, saveFirebaseRegistration } from "@/services/firebaseRegistrations";
import {
  BRANCH_OPTIONS,
  YEAR_OPTIONS,
  collegeEmail,
  normalisePhone,
  phone as phoneRule,
  rollNumber,
} from "@/lib/validators";
import { Alert, Button, Field, Input, Select, buttonStyles } from "@/components/ui/kit";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: collegeEmail,
  phone: phoneRule.optional().or(z.literal("")),
  rollNumber,
  year: z.string().min(1, "Select your year"),
  branch: z.string().min(1, "Select your branch"),
});

type FormValues = z.infer<typeof schema>;

export default function EventRegistrationForm({
  event,
  onSuccess,
}: {
  event: Event;
  onSuccess?: (registration: Registration) => void;
}) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onBlur" });

  const onSubmit = async (values: FormValues) => {
    setError("");
    const payload = {
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date,
      eventVenue: event.venue,
      name: values.name,
      email: values.email,
      phone: values.phone,
      rollNumber: values.rollNumber,
      year: values.year,
      branch: values.branch,
    };

    try {
      let result: Registration;
      try {
        // Primary path — production API (issues the ticket + email).
        result = await api.register(payload);
        saveFirebaseRegistration({
          ...result,
          phone: values.phone || "",
          rollNumber: values.rollNumber,
          year: values.year,
          branch: values.branch,
        }).catch((fbErr: Error) => console.warn("[Registration] Firestore mirror note:", fbErr.message));
      } catch (apiError) {
        // Resilient path — write straight to Firestore and mint the QR locally.
        console.warn("[Registration] API unavailable, using direct Firestore path:", (apiError as Error).message);
        result = await createRegistrationDirect(payload);
        toast.info("Ticket generated offline", {
          description: "Your seat is saved. The confirmation email will follow once the mail service is back.",
        });
      }

      setRegistration(result);
      setStep("success");
      onSuccess?.(result);
      toast.success("Registration confirmed", { description: `See you at ${event.name}.` });
    } catch (err) {
      const message = (err as Error).message ?? "Registration failed. Please try again.";
      setError(message);
      toast.error("Registration failed", { description: message });
    }
  };

  if (step === "success") {
    return (
      <div className="rounded-[24px] border border-line bg-surface p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#E9F9F0] text-[#0F7A46]">
          <CircleCheck className="h-7 w-7" />
        </span>
        <h3 className="mt-5 font-display text-[22px] font-semibold text-ink">Registration successful</h3>
        <p className="mt-2 text-[14.5px] text-muted">
          Your QR ticket is ready for <strong className="text-ink">{registration?.participantEmail}</strong>.
        </p>

        {registration?.qrDataUrl ? (
          <div className="mt-6 flex justify-center">
            <div className="rounded-[20px] border border-line bg-white p-4 shadow-[var(--shadow-md)]">
              <img src={registration.qrDataUrl} alt="Your QR ticket" className="h-48 w-48 rounded-md" />
            </div>
          </div>
        ) : null}

        <p className="mt-4 text-[12.5px] text-muted">Present this QR code at the event entrance for scanning.</p>

        {event.whatsappGroupUrl ? (
          <a
            href={event.whatsappGroupUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonStyles("primary", "md", "mt-6 w-full")}
            style={{ backgroundColor: "#1FA855" }}
          >
            <MessageCircle className="h-4 w-4" />
            Join the WhatsApp group
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {error ? <Alert tone="error" title="We could not complete your registration">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required error={errors.name?.message} className="sm:col-span-2">
          <Input {...register("name")} placeholder="Your full name" autoComplete="name" aria-invalid={!!errors.name} />
        </Field>

        <Field label="Email" required error={errors.email?.message}>
          <Input
            {...register("email")}
            type="email"
            placeholder="example@gmail.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
          />
        </Field>

        <Field label="Phone" hint="Optional" error={errors.phone?.message}>
          <Input
            {...register("phone", {
              onChange: (event) => {
                event.target.value = normalisePhone(event.target.value);
              },
            })}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit mobile number"
            autoComplete="tel"
          />
        </Field>

        <Field label="Roll number" required error={errors.rollNumber?.message}>
          <Input
            {...register("rollNumber")}
            placeholder="e.g. 2400330100242"
            aria-invalid={!!errors.rollNumber}
            className="uppercase"
          />
        </Field>

        <Field label="Year" required error={errors.year?.message}>
          <Select {...register("year")} defaultValue="" aria-invalid={!!errors.year}>
            <option value="" disabled>
              Select year
            </option>
            {YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Branch" required error={errors.branch?.message} className="sm:col-span-2">
          <Select {...register("branch")} defaultValue="" aria-invalid={!!errors.branch}>
            <option value="" disabled>
              Select branch
            </option>
            {BRANCH_OPTIONS.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Button type="submit" size="lg" variant="ember" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" /> Reserving your seat…
          </>
        ) : (
          `Confirm registration`
        )}
      </Button>
      <p className="text-center text-[12px] text-muted">
        By registering you agree to receive event updates from SPIC, RKGIT.
      </p>
    </form>
  );
}
