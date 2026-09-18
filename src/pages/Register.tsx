import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, Info, LoaderCircle, MapPin, Users } from "lucide-react";
import EventRegistrationForm from "@/components/forms/EventRegistrationForm";
import TeamRegistrationForm from "@/components/forms/TeamRegistrationForm";
import SmartImage from "@/components/site/SmartImage";
import EventNotes from "@/components/site/EventNotes";
import Reveal from "@/components/site/Reveal";
import { eventCover } from "@/components/site/EventCard";
import { Alert, Badge, buttonStyles, statusTone } from "@/components/ui/kit";
import { formatEventDate, formatEventDateTime, useCountdown, useEvent } from "@/hooks/useSpicData";

export default function Register() {
  const { eventId } = useParams<{ eventId: string }>();
  const { event, loading } = useEvent(eventId);
  const countdown = useCountdown(event?.date);

  if (loading && !event) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <LoaderCircle className="h-7 w-7 animate-spin text-brand" />
        <p className="text-sm text-muted">Loading event details…</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="shell py-24 text-center">
        <h1 className="font-display text-[2.5rem] font-semibold tracking-[-0.04em] text-ink">Event not found</h1>
        <p className="mt-3 text-muted">The event you are looking for does not exist or has been removed.</p>
        <Link to="/events" className={buttonStyles("primary", "md", "mt-8")}>
          Back to events
        </Link>
      </div>
    );
  }

  const isTeamEvent = event.registrationType === "team";

  return (
    <div className="shell py-10 lg:py-16">
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-muted transition hover:text-deep"
      >
        <ArrowLeft className="h-4 w-4" /> All events
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        {/* Event context */}
        <Reveal direction="right">
          <div className="lg:sticky lg:top-28">
            <div className="edge-gradient grain-overlay relative overflow-hidden rounded-[30px] shadow-[var(--shadow-xl)]">
              <SmartImage src={eventCover(event)} alt={event.name} rounded="rounded-[30px]" className="aspect-[4/3]" priority />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,23,41,0.08)_0%,transparent_34%,rgba(4,23,41,0.9)_100%)]" />
              <div className="absolute inset-x-5 bottom-5">
                <div className="flex flex-wrap gap-2">
                  <Badge tone={statusTone(event.status)} className="bg-white/88">
                    {event.status}
                  </Badge>
                  <Badge className="bg-white/20 text-white ring-white/25">{event.category}</Badge>
                </div>
                <h1 className="mt-3 font-display text-[clamp(1.7rem,3.4vw,2.5rem)] leading-tight font-semibold tracking-[-0.03em] text-white">
                  {event.name}
                </h1>
              </div>
            </div>

            <p className="mt-5 text-[15.5px] leading-relaxed text-muted">{event.description}</p>

            <EventNotes notes={event.notes} className="mt-6" />

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { icon: CalendarDays, label: "Date", value: formatEventDate(event.date) },
                { icon: Clock, label: "Time", value: event.time ?? "To be announced" },
                { icon: MapPin, label: "Venue", value: event.venue },
                {
                  icon: Users,
                  label: "Format",
                  value: isTeamEvent ? `Team of ${event.minTeamSize ?? 1}–${event.maxTeamSize ?? 4}` : "Individual entry",
                },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-3 rounded-[16px] border border-line bg-surface p-4">
                  <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                  <div>
                    <dt className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">{row.label}</dt>
                    <dd className="mt-0.5 text-[14px] font-medium text-ink">{row.value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {countdown && !countdown.isPast ? (
              <div className="mt-4 grid grid-cols-4 gap-2 rounded-[18px] border border-line bg-mist p-4 text-center">
                {[
                  { v: countdown.days, l: "Days" },
                  { v: countdown.hours, l: "Hours" },
                  { v: countdown.minutes, l: "Min" },
                  { v: countdown.seconds, l: "Sec" },
                ].map((unit) => (
                  <div key={unit.l}>
                    <p className="font-display text-[22px] font-semibold tabular-nums text-deep">
                      {String(unit.v).padStart(2, "0")}
                    </p>
                    <p className="text-[10.5px] font-semibold tracking-[0.14em] text-muted uppercase">{unit.l}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </Reveal>

        {/* Registration */}
        <Reveal direction="left">
          <div className="rounded-[30px] border border-line bg-surface p-6 shadow-[var(--shadow-md)] sm:p-9">
            <p className="eyebrow">Registration</p>
            <h2 className="mt-2 font-display text-[26px] font-semibold tracking-[-0.03em] text-ink">
              {isTeamEvent ? "Register your team" : "Reserve your seat"}
            </h2>
            <p className="mt-2 text-[14.5px] text-muted">
              {isTeamEvent
                ? "Add every member — each one receives their own QR ticket for entry."
                : "Fill in your details and your QR ticket is issued instantly."}
            </p>

            <div className="mt-6">
              {event.status !== "open" ? (
                <Alert tone="warn" title={`Registration ${event.status}`}>
                  Registration for <strong>{event.name}</strong> is currently {event.status}. Follow SPIC for the next
                  window.
                  <div className="mt-3">
                    <Link to="/events" className={buttonStyles("outline", "sm")}>
                      Browse open events
                    </Link>
                  </div>
                </Alert>
              ) : isTeamEvent ? (
                <TeamRegistrationForm event={event} />
              ) : (
                <EventRegistrationForm event={event} />
              )}
            </div>

            {event.status === "open" ? (
              <p className="mt-5 flex items-start gap-2 text-[12.5px] text-muted">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                Keep your QR ticket handy — the SPIC scanner marks attendance at the venue entrance.
                {event.registrationDeadline ? ` Registrations close ${formatEventDateTime(event.registrationDeadline)}.` : null}
              </p>
            ) : null}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
