import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, CalendarDays, MapPin, Search, TriangleAlert } from "lucide-react";
import type { Event } from "@/data/events";
import EventCard, { eventCover } from "@/components/site/EventCard";
import SmartImage from "@/components/site/SmartImage";
import EventNotes from "@/components/site/EventNotes";
import Reveal, { StaggerItem, StaggerList } from "@/components/site/Reveal";
import { GridField, MeshBackdrop } from "@/components/site/Atmosphere";
import { Alert, Badge, buttonStyles, EmptyState, Input, SectionHeading, Skeleton, statusTone } from "@/components/ui/kit";
import { formatEventDate, useEvents } from "@/hooks/useSpicData";
import { cn } from "@/utils/cn";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "open", label: "Registrations open" },
  { key: "upcoming", label: "Upcoming" },
  { key: "closed", label: "Closed" },
  { key: "ended", label: "Past" },
] as const;

export default function Events() {
  const { events, state, error, isLoading } = useEvents();
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]["key"]>("all");
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(events.map((e) => e.category).filter(Boolean)))],
    [events],
  );

  const featured = useMemo(
    () => events.find((e) => e.featured && e.status === "open") ?? events.find((e) => e.status === "open") ?? events[0],
    [events],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return events.filter((event) => {
      const statusOk = status === "all" || event.status === status;
      const categoryOk = category === "all" || event.category === category;
      const searchOk =
        !term ||
        [event.name, event.description, event.venue, event.category].some((value) =>
          (value ?? "").toLowerCase().includes(term),
        );
      return statusOk && categoryOk && searchOk;
    });
  }, [events, status, category, query]);

  const live = filtered.filter((e) => e.status === "open" || e.status === "upcoming");
  const archive = filtered.filter((e) => e.status === "ended" || e.status === "closed");

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <MeshBackdrop variant="light" className="-top-36" />
        <GridField />
        <div className="shell relative grid gap-10 py-14 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:py-20">
          <div>
            <p className="eyebrow">
              <span className="inline-block h-px w-6 bg-brand/45" aria-hidden />
              Events
            </p>
            <h1 className="mt-4 text-[clamp(2.5rem,6.2vw,4.6rem)] leading-[0.94] font-semibold tracking-[-0.05em] text-ink">
              Every build, pitch and
              <br />
              <span className="serif-accent gradient-text">stage moment</span>
              <span className="gradient-text"> at RKGIT.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted">
              Discover what is happening across the SPIC calendar — hackathons, expert talks, industry visits and
              flagship competitions. Registrations open right here.
            </p>
          </div>

          {featured ? (
            <Reveal direction="left" className="relative">
              <div className="edge-gradient grain-overlay relative overflow-hidden rounded-[30px] shadow-[var(--shadow-xl)]">
                <SmartImage src={eventCover(featured)} alt={featured.name} rounded="rounded-[30px]" className="aspect-[5/4]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,23,41,0.08)_0%,transparent_34%,rgba(4,23,41,0.88)_100%)]" />
                <div className="absolute inset-x-5 bottom-5 text-white">
                  <Badge tone={statusTone(featured.status)} className="bg-white/85">
                    {featured.status}
                  </Badge>
                  <p className="mt-2 font-display text-[24px] leading-tight font-semibold">{featured.name}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white/85">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" /> {formatEventDate(featured.date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {featured.venue}
                    </span>
                  </p>
                  {featured.status === "open" ? (
                    <Link to={`/register/${featured.id}`} className={buttonStyles("ember", "sm", "mt-4")}>
                      Register now <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ) : null}
        </div>

        {featured?.notes?.filter(Boolean).length ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <EventNotes notes={featured.notes} title={`Before you attend ${featured.name}`} />
            <p className="text-[13.5px] leading-relaxed text-muted">
              These instructions come directly from the organising team. Follow them to avoid any hassle at the venue
              entrance.
            </p>
          </div>
        ) : null}
      </section>

      {/* Filters */}
      <section className="sticky top-[4.6rem] z-30 border-y border-line bg-canvas/82 py-3 backdrop-blur-2xl backdrop-saturate-150">
        <div className="shell flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="hide-scrollbar flex gap-2 overflow-x-auto">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setStatus(filter.key)}
                aria-pressed={status === filter.key}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-all duration-250 ease-[var(--ease-out-soft)]",
                  status === filter.key
                    ? "border-transparent bg-[linear-gradient(135deg,#0b3b66,#12639f)] text-white shadow-[var(--shadow-brand)]"
                    : "border-line bg-surface text-muted hover:-translate-y-0.5 hover:border-brand/35 hover:text-ink hover:shadow-[var(--shadow-sm)]",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hide-scrollbar flex gap-2 overflow-x-auto">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold capitalize transition-all",
                    category === item ? "bg-ice text-deep" : "text-muted hover:bg-mist hover:text-ink",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="relative min-w-[12rem] flex-1 lg:w-64 lg:flex-none">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search events"
                aria-label="Search events"
                className="h-10 pl-9"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-14 lg:py-20">
        {state === "fallback" ? (
          <Alert tone="warn" title="Showing the last published schedule">
            Live event data could not be reached ({error}). You are viewing the bundled schedule.
          </Alert>
        ) : null}

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-80" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<TriangleAlert className="h-7 w-7" />}
            title="No events match those filters"
            description="Try clearing the search or switching category."
            action={
              <button
                type="button"
                onClick={() => {
                  setStatus("all");
                  setCategory("all");
                  setQuery("");
                }}
                className={buttonStyles("outline", "sm", "mt-2")}
              >
                Reset filters
              </button>
            }
          />
        ) : (
          <div className="space-y-16">
            {live.length ? (
              <div>
                <SectionHeading
                  eyebrow="Now & next"
                  title="Upcoming events"
                  description="Secure your spot — registrations close as soon as capacity fills."
                />
                <StaggerList className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {live.map((event: Event) => (
                    <StaggerItem key={event.id} className="h-full">
                      <EventCard event={event} />
                    </StaggerItem>
                  ))}
                </StaggerList>
              </div>
            ) : null}

            {archive.length ? (
              <div>
                <SectionHeading
                  eyebrow="Archive"
                  title="Past events"
                  description="Every edition documented — revisit highlights inside the gallery."
                  action={
                    <Link to="/gallery" className={buttonStyles("ghost", "md", "rounded-full")}>
                      View gallery <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  }
                />
                <StaggerList className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {archive.map((event: Event) => (
                    <StaggerItem key={event.id} className="h-full">
                      <EventCard event={event} />
                    </StaggerItem>
                  ))}
                </StaggerList>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </>
  );
}
