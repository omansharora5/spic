import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, Clock, MapPin } from "lucide-react";
import type { Event } from "@/data/events";
import { Badge, buttonStyles, statusTone } from "@/components/ui/kit";
import SmartImage from "./SmartImage";
import { Spotlight } from "./Atmosphere";
import { formatEventDate } from "@/hooks/useSpicData";
import { cn } from "@/utils/cn";

export function eventCover(event: Event): string | undefined {
  if (event.image) return event.image;
  if (event.imageList?.length) {
    const first = event.imageList[0];
    return first.startsWith("http") || first.startsWith("/")
      ? first
      : `/events/${event.id.toLowerCase().replace(/\s+/g, "-")}/${first}`;
  }
  return undefined;
}

export default function EventCard({ event, className }: { event: Event; className?: string }) {
  const isOpen = event.status === "open";

  return (
    <Spotlight
      as="article"
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-[var(--shadow-sm)]",
        "transition-all duration-350 ease-[var(--ease-out-soft)] hover:-translate-y-2 hover:border-brand/25 hover:shadow-[var(--shadow-lg)]",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <SmartImage
          src={eventCover(event)}
          alt={event.name}
          rounded="rounded-none"
          className="h-full w-full"
          imgClassName="transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.07]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#04172a]/62 to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge tone={statusTone(event.status)} className="shadow-[var(--shadow-xs)] backdrop-blur">
            {event.status}
          </Badge>
          {event.category ? (
            <Badge className="bg-white/85 text-deep ring-white/40 backdrop-blur">{event.category}</Badge>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-5">
        <h3 className="font-display text-[19px] leading-snug font-semibold text-ink">{event.name}</h3>
        <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-muted">{event.description}</p>

        <dl className="mt-4 grid gap-2 text-[13px] text-muted">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-brand" aria-hidden />
            <dd>{formatEventDate(event.date)}</dd>
          </div>
          {event.time ? (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-brand" aria-hidden />
              <dd>{event.time}</dd>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-brand" aria-hidden />
            <dd className="truncate">{event.venue}</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-center gap-2 pt-1">
          {isOpen ? (
            <Link to={`/register/${event.id}`} className={buttonStyles("ember", "sm", "flex-1")}>
              Register now
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <span className="flex-1 rounded-xs border border-line bg-mist px-3.5 py-2 text-center text-[13px] font-semibold text-muted capitalize">
              Registration {event.status}
            </span>
          )}
          {event.registrationType === "team" ? (
            <span className="rounded-xs border border-line px-2.5 py-2 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
              Team {event.minTeamSize ?? 1}–{event.maxTeamSize ?? 4}
            </span>
          ) : null}
        </div>
      </div>
    </Spotlight>
  );
}
