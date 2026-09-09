import { Info } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Organiser-authored instructions for participants ("bring your laptop", etc.).
 * Content is authored in the admin event editor and stored on the event document.
 */
export default function EventNotes({
  notes,
  className,
  title = "What to bring & know",
  compact = false,
}: {
  notes?: string[];
  className?: string;
  title?: string;
  compact?: boolean;
}) {
  const items = (notes ?? []).map((note) => note.trim()).filter(Boolean);
  if (!items.length) return null;

  return (
    <section
      className={cn(
        "rounded-[22px] border border-brand/18 bg-[linear-gradient(140deg,#F4FAFE_0%,#FFFFFF_58%,#FFF6F0_100%)] p-5 sm:p-6",
        className,
      )}
      aria-label={title}
    >
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-[11px] bg-ice text-brand">
          <Info className="h-4 w-4" />
        </span>
        <h3 className="text-[11.5px] font-bold tracking-[0.18em] text-deep uppercase">{title}</h3>
      </div>

      <ul className={cn("mt-4 space-y-2.5", compact && "space-y-2")}>
        {items.map((note, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="mt-[3px] grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#1f86db,#7fd0fb)] text-[10px] font-bold text-white">
              {index + 1}
            </span>
            <span className={cn("text-[14.5px] leading-relaxed text-ink/85", compact && "text-[13.5px]")}>{note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
