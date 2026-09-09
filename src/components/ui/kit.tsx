import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

/* ── Buttons ──────────────────────────────────────────────────── */

type Variant = "primary" | "ember" | "outline" | "ghost" | "subtle" | "glass";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "sweep-host bg-[linear-gradient(135deg,#0b3b66_0%,#0a4b80_52%,#12639f_100%)] text-white shadow-[var(--shadow-brand)] hover:shadow-[0_18px_44px_-14px_rgba(11,59,102,0.62)]",
  ember:
    "sweep-host bg-[linear-gradient(135deg,#f97316_0%,#ff8f3c_54%,#ffb454_120%)] text-white shadow-[var(--shadow-ember)] hover:shadow-[0_20px_46px_-14px_rgba(249,115,22,0.62)]",
  outline:
    "border border-line-strong bg-surface/90 text-ink backdrop-blur-sm hover:border-brand/50 hover:bg-mist hover:shadow-[var(--shadow-sm)]",
  ghost: "text-ink/75 hover:bg-ice hover:text-deep",
  subtle: "bg-ice text-deep ring-1 ring-inset ring-brand/10 hover:bg-[#dbeeff]",
  glass: "glass-dark text-white hover:bg-white/16",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-xs",
  md: "h-11 px-5 text-sm gap-2 rounded-sm",
  lg: "h-[3.25rem] px-7 text-[15px] gap-2.5 rounded-md",
};

export function buttonStyles(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "relative inline-flex items-center justify-center font-semibold tracking-[-0.011em] whitespace-nowrap",
    "transition-[transform,box-shadow,background-color,border-color,color] duration-250 ease-[var(--ease-out-soft)]",
    "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, children, ...props },
  ref,
) {
  return (
    <button ref={ref} className={buttonStyles(variant, size, className)} {...props}>
      <span className="relative z-10 inline-flex items-center gap-[inherit]">{children}</span>
    </button>
  );
});

/* ── Badges & pills ───────────────────────────────────────────── */

export function Badge({
  children,
  tone = "blue",
  className,
}: {
  children: ReactNode;
  tone?: "blue" | "ember" | "neutral" | "green" | "slate" | "iris";
  className?: string;
}) {
  const tones = {
    blue: "bg-ice text-brand-600 ring-brand/15",
    ember: "bg-ember-soft text-[#C2410C] ring-ember/20",
    neutral: "bg-mist text-muted ring-line",
    green: "bg-[#E7F8F1] text-[#0B7A55] ring-[#0B7A55]/15",
    slate: "bg-[#EDF2F7] text-[#425A72] ring-[#425A72]/12",
    iris: "bg-[#EEF0FE] text-[#4453D6] ring-[#6172F3]/18",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold tracking-[0.14em] uppercase ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status?: string): "blue" | "ember" | "neutral" | "green" | "slate" {
  switch (status) {
    case "open":
      return "green";
    case "upcoming":
      return "ember";
    case "closed":
      return "slate";
    case "ended":
      return "neutral";
    default:
      return "blue";
  }
}

/* ── Surfaces ─────────────────────────────────────────────────── */

export function Surface({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-surface shadow-[var(--shadow-sm)]",
        interactive &&
          "transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:border-line-strong hover:shadow-[var(--shadow-md)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className,
  invert = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
  invert?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
        {eyebrow ? (
          <p className={cn("eyebrow mb-3.5", invert && "text-sky")}>
            <span
              className={cn("h-px w-6", invert ? "bg-sky/60" : "bg-brand/45")}
              style={{ display: "inline-block" }}
              aria-hidden
            />
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            "text-[clamp(1.85rem,3.6vw,2.9rem)] leading-[1.03] font-semibold",
            invert ? "text-white" : "text-ink",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className={cn("mt-4 text-[15.5px] leading-relaxed", invert ? "text-white/72" : "text-muted")}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ── Form controls ────────────────────────────────────────────── */

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-semibold text-ink">
          {label}
          {required ? <span className="ml-0.5 text-ember">*</span> : null}
        </span>
        {hint ? <span className="text-[11px] text-faint">{hint}</span> : null}
      </span>
      {children}
      {error ? (
        <span role="alert" className="text-[12px] font-medium text-[#C2410C]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

const controlBase =
  "w-full rounded-sm border border-line bg-veil px-3.5 py-2.5 text-sm text-ink placeholder:text-faint shadow-[var(--shadow-xs)] transition-all duration-200 hover:border-line-strong focus:border-brand focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/12 disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(controlBase, className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select ref={ref} className={cn(controlBase, "appearance-none pr-9", className)} {...props}>
      {children}
    </select>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(controlBase, "min-h-28 resize-y", className)} {...props} />;
  },
);

/* ── Feedback ─────────────────────────────────────────────────── */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line-strong bg-[linear-gradient(180deg,#FBFDFF_0%,#F1F8FE_100%)] px-6 py-16 text-center">
      {icon ? (
        <span className="grid h-12 w-12 place-items-center rounded-full bg-surface text-brand shadow-[var(--shadow-sm)]">
          {icon}
        </span>
      ) : null}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description ? <p className="max-w-md text-sm text-muted">{description}</p> : null}
      {action}
    </div>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn" | "error" | "success";
  title?: string;
  children?: ReactNode;
}) {
  const tones = {
    info: "border-brand/20 bg-ice text-deep",
    warn: "border-ember/25 bg-ember-soft text-[#9A3412]",
    error: "border-[#F3B4B4] bg-[#FEF3F2] text-[#B42318]",
    success: "border-[#A3E2C7] bg-[#EFFBF5] text-[#0B7A55]",
  } as const;
  return (
    <div role="status" className={cn("rounded-md border px-4 py-3 text-sm shadow-[var(--shadow-xs)]", tones[tone])}>
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className="mt-0.5 leading-relaxed opacity-90">{children}</div> : null}
    </div>
  );
}
