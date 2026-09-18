import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleCheck, LoaderCircle, MessageCircle, Paperclip, Plus, Trash, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Event } from "@/data/events";
import { api } from "@/services/api";
import { createTeamRegistrationDirect, saveFirebaseTeamRegistration } from "@/services/firebaseRegistrations";
import {
  BRANCH_OPTIONS,
  SECTION_OPTIONS,
  YEAR_OPTIONS,
  normalisePhone,
  teamMemberSchema,
} from "@/lib/validators";
import { Alert, Badge, Button, Field, Input, Select, buttonStyles } from "@/components/ui/kit";

export default function TeamRegistrationForm({ event }: { event: Event }) {
  const minSize = event.minTeamSize ?? 1;
  const maxSize = event.maxTeamSize ?? 4;

  const schema = z
    .object({
      teamName: z.string().min(2, "Team name must be at least 2 characters"),
      members: z.array(teamMemberSchema).min(minSize, `At least ${minSize} member(s) required`).max(maxSize),
    })
    .superRefine((values, ctx) => {
      // The same person cannot occupy two slots — each member gets their own ticket.
      const seenEmail = new Map<string, number>();
      const seenRoll = new Map<string, number>();

      values.members.forEach((member, index) => {
        const email = member.email.trim().toLowerCase();
        const roll = member.rollNumber.trim().toUpperCase();

        if (email) {
          const first = seenEmail.get(email);
          if (first !== undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["members", index, "email"],
              message: `Same email as member ${first + 1}`,
            });
          } else {
            seenEmail.set(email, index);
          }
        }

        if (roll) {
          const first = seenRoll.get(roll);
          if (first !== undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["members", index, "rollNumber"],
              message: `Same roll number as member ${first + 1}`,
            });
          } else {
            seenRoll.set(roll, index);
          }
        }
      });
    });
  type FormValues = z.infer<typeof schema>;

  const [step, setStep] = useState<"form" | "success">("form");
  const [result, setResult] = useState<{ id: string; teamName: string; qrDataUrl: string; message: string } | null>(null);
  const [error, setError] = useState("");
  const [pptFile, setPptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const emptyMember = { name: "", email: "", rollNumber: "", year: "", branch: "", section: "", phone: "" };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { teamName: "", members: Array.from({ length: minSize }, () => ({ ...emptyMember })) },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "members" });

  const uploadPpt = async (): Promise<string> => {
    if (!pptFile) return "";
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", pptFile);
      const response = await api.uploadPPT(formData);
      return response.url;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setError("");

    if (event.requirePpt && !pptFile) {
      setError("A presentation file (.ppt, .pptx or .pdf) is required for this event.");
      return;
    }

    try {
      let pptLink = "";
      if (pptFile) {
        try {
          pptLink = await uploadPpt();
        } catch (uploadError) {
          console.warn("[Team registration] PPT upload failed:", (uploadError as Error).message);
          toast.warning("Presentation upload failed", {
            description: "Your team is still registered — please email the deck to the organisers.",
          });
        }
      }

      const payload = {
        eventId: event.id,
        eventName: event.name,
        eventDate: event.date,
        eventVenue: event.venue,
        teamName: values.teamName,
        members: values.members,
        pptLink,
      };

      let response;
      try {
        response = await api.registerTeam(payload);
        saveFirebaseTeamRegistration({ ...payload, ...response }).catch((fbErr: Error) =>
          console.warn("[Team registration] Firestore mirror note:", fbErr.message),
        );
      } catch (apiError) {
        console.warn("[Team registration] API unavailable, using direct Firestore path:", (apiError as Error).message);
        response = await createTeamRegistrationDirect(payload);
        toast.info("Tickets generated offline", {
          description: "Your team is saved. Confirmation emails follow once the mail service is back.",
        });
      }

      setResult(response);
      setStep("success");
      toast.success("Team registered", { description: `${values.teamName} is confirmed for ${event.name}.` });
    } catch (err) {
      const message = (err as Error).message ?? "Team registration failed. Please try again.";
      setError(message);
      toast.error("Team registration failed", { description: message });
    }
  };

  if (step === "success") {
    return (
      <div className="rounded-[24px] border border-line bg-surface p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#E9F9F0] text-[#0F7A46]">
          <CircleCheck className="h-7 w-7" />
        </span>
        <h3 className="mt-5 font-display text-[22px] font-semibold text-ink">
          {result?.teamName} is registered
        </h3>
        <p className="mt-2 text-[14.5px] text-muted">
          {result?.message ?? "Each member receives an individual QR ticket by email."}
        </p>

        {result?.qrDataUrl ? (
          <div className="mt-6 flex justify-center">
            <div className="rounded-[20px] border border-line bg-white p-4 shadow-[var(--shadow-md)]">
              <img src={result.qrDataUrl} alt="Team QR ticket" className="h-48 w-48 rounded-md" />
            </div>
          </div>
        ) : null}

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {error ? <Alert tone="error" title="We could not complete the registration">{error}</Alert> : null}

      <Field label="Team name" required error={errors.teamName?.message}>
        <Input {...register("teamName")} placeholder="e.g. Team Voyager" aria-invalid={!!errors.teamName} />
      </Field>

      <div className="rounded-[16px] border border-brand/18 bg-ice/70 px-4 py-3">
        <p className="text-[12.5px] leading-relaxed text-deep">
          Enter each member using their email address, a valid 10-digit mobile number and their roll number. Duplicate
          emails or roll numbers are not allowed.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[17px] font-semibold text-ink">Team members</h3>
            <Badge tone="neutral">
              {fields.length}/{maxSize}
            </Badge>
          </div>
          <Button
            type="button"
            variant="subtle"
            size="sm"
            onClick={() => append({ ...emptyMember })}
            disabled={fields.length >= maxSize}
          >
            <Plus className="h-3.5 w-3.5" /> Add member
          </Button>
        </div>

        {fields.map((field, index) => (
          <fieldset key={field.id} className="rounded-[20px] border border-line bg-mist/60 p-5">
            <legend className="flex items-center gap-2 px-2 text-[12px] font-bold tracking-[0.16em] text-muted uppercase">
              {index === 0 ? "Team lead" : `Member ${index + 1}`}
            </legend>

            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <Field label="Name" required error={errors.members?.[index]?.name?.message}>
                <Input {...register(`members.${index}.name` as const)} placeholder="Full name" />
              </Field>
              <Field
                label="Email"
                required
                error={errors.members?.[index]?.email?.message}
              >
                <Input
                  {...register(`members.${index}.email` as const)}
                  type="email"
                  placeholder="example@gmail.com"
                  aria-invalid={!!errors.members?.[index]?.email}
                />
              </Field>
              <Field label="Roll number" required error={errors.members?.[index]?.rollNumber?.message}>
                <Input
                  {...register(`members.${index}.rollNumber` as const)}
                  placeholder="e.g. 2400330100242"
                  className="uppercase"
                  aria-invalid={!!errors.members?.[index]?.rollNumber}
                />
              </Field>
              <Field label="Phone" required error={errors.members?.[index]?.phone?.message}>
                <Input
                  {...register(`members.${index}.phone` as const, {
                    onChange: (event) => {
                      event.target.value = normalisePhone(event.target.value);
                    },
                  })}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  aria-invalid={!!errors.members?.[index]?.phone}
                />
              </Field>
              <Field label="Year" required error={errors.members?.[index]?.year?.message}>
                <Select {...register(`members.${index}.year` as const)} defaultValue="">
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
              <Field label="Branch" required error={errors.members?.[index]?.branch?.message}>
                <Select {...register(`members.${index}.branch` as const)} defaultValue="">
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
              <Field label="Section" required error={errors.members?.[index]?.section?.message}>
                <Select {...register(`members.${index}.section` as const)} defaultValue="">
                  <option value="" disabled>
                    Select section
                  </option>
                  {SECTION_OPTIONS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            {fields.length > minSize ? (
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#B42318] transition hover:underline"
              >
                <Trash className="h-3.5 w-3.5" /> Remove member
              </button>
            ) : null}
          </fieldset>
        ))}
      </div>

      {/* PPT upload */}
      <div className="rounded-[20px] border border-dashed border-line-strong bg-surface p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-ice text-brand">
            <Upload className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-ink">
              Pitch deck {event.requirePpt ? <span className="text-ember">*</span> : <span className="text-muted">(optional)</span>}
            </p>
            <p className="mt-1 text-[12.5px] text-muted">Accepted formats: .ppt, .pptx, .pdf</p>
            <input
              id="ppt-upload"
              type="file"
              accept=".ppt,.pptx,.pdf"
              onChange={(event_) => setPptFile(event_.target.files?.[0] ?? null)}
              className="mt-3 block w-full text-[13px] text-muted file:mr-3 file:rounded-full file:border-0 file:bg-deep file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-white hover:file:bg-[#0e4c82]"
            />
            {pptFile ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-deep">
                <Paperclip className="h-3.5 w-3.5" /> {pptFile.name}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <Button type="submit" size="lg" variant="ember" className="w-full" disabled={isSubmitting || uploading}>
        {isSubmitting || uploading ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            {uploading ? "Uploading deck…" : "Registering team…"}
          </>
        ) : (
          "Register team"
        )}
      </Button>
    </form>
  );
}
