import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  GraduationCap,
  Lightbulb,
  MapPin,
  MoveDown,
  Rocket,
  Sparkles,
  Users,
} from "lucide-react";
import Reveal, { StaggerItem, StaggerList } from "@/components/site/Reveal";
import SmartImage from "@/components/site/SmartImage";
import Counter from "@/components/site/Counter";
import EventCard, { eventCover } from "@/components/site/EventCard";
import { Grain, GridField, MeshBackdrop, Spotlight } from "@/components/site/Atmosphere";
import { Badge, buttonStyles, SectionHeading, Skeleton, statusTone } from "@/components/ui/kit";
import { brand, featureCards, impactStats, marqueeWords, aboutCopy } from "@/data/content";
import { formatEventDate, useCountdown, useEvents, useGallery, usePrefersReducedMotion } from "@/hooks/useSpicData";

const FEATURE_ICONS = [Lightbulb, Rocket, Users, GraduationCap];
const FEATURE_TINTS = [
  "from-[#E6F4FF] to-[#D2EBFF] text-brand",
  "from-[#FFF3EA] to-[#FFE3CE] text-ember",
  "from-[#EEF0FE] to-[#E0E4FD] text-[#4453D6]",
  "from-[#E6FAF6] to-[#D3F4EC] text-[#0B7A55]",
];
const COMMUNITY_IMAGE = "https://i.postimg.cc/HsBnfz1y/spic-community.jpg";

export default function Index() {
  const { events, isLoading } = useEvents();
  const { albums } = useGallery();
  const reduced = usePrefersReducedMotion();

  const featured = useMemo(
    () => events.find((e) => e.featured && e.status === "open") ?? events.find((e) => e.status === "open") ?? events[0],
    [events],
  );
  const upcoming = useMemo(
    () => events.filter((e) => (e.status === "open" || e.status === "upcoming") && e.id !== featured?.id).slice(0, 3),
    [events, featured],
  );
  const photos = useMemo(() => albums.flatMap((album) => album.images).slice(0, 14), [albums]);
  const countdown = useCountdown(featured?.date);

  const heroImage = eventCover(featured ?? ({} as never)) || photos[0] || COMMUNITY_IMAGE;
  const secondaryImage = photos[1] || COMMUNITY_IMAGE;
  const tertiaryImage = photos[2] || photos[0] || COMMUNITY_IMAGE;

  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "15%"]);
  const heroScale = useTransform(heroProgress, [0, 1], reduced ? [1, 1] : [1, 1.08]);
  const heroFade = useTransform(heroProgress, [0, 0.85], [1, reduced ? 1 : 0.32]);

  const storyRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: storyProgress } = useScroll({ target: storyRef, offset: ["start end", "end start"] });
  const railX = useTransform(storyProgress, [0, 1], reduced ? ["0%", "0%"] : ["6%", "-38%"]);
  const railXAlt = useTransform(storyProgress, [0, 1], reduced ? ["0%", "0%"] : ["-18%", "12%"]);

  return (
    <>
      {/* ════════════════════ HERO ════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden pb-8">
        <MeshBackdrop variant="light" className="-top-44" />
        <GridField />

        <div className="shell relative grid items-center gap-14 pt-6 pb-16 lg:grid-cols-[1.06fr_0.94fr] lg:gap-10 lg:pt-14 lg:pb-24">
          <motion.div style={{ opacity: heroFade }} className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/70 bg-white/70 py-1.5 pr-4 pl-1.5 shadow-[var(--shadow-sm)] backdrop-blur-xl"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[linear-gradient(135deg,#f97316,#ffb454)] text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11.5px] font-bold tracking-[0.16em] text-deep uppercase">{brand.eyebrow}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 text-[clamp(2.8rem,7.6vw,5.6rem)] leading-[0.92] font-semibold tracking-[-0.05em] text-ink"
            >
              Build. Create.
              <br />
              Launch the <span className="serif-accent gradient-text pr-1">next</span>
              <span className="gradient-text"> idea.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 max-w-xl text-[16.5px] leading-[1.7] text-muted"
            >
              {brand.heroLead}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link to="/events" className={buttonStyles("primary", "lg")}>
                <span className="relative z-10 inline-flex items-center gap-2.5">
                  Explore events
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link to="/join" className={buttonStyles("outline", "lg")}>
                Join SPIC
              </Link>
              {featured?.status === "open" ? (
                <Link
                  to={`/register/${featured.id}`}
                  className="group ml-1 inline-flex items-center gap-2 px-1 text-[14px] font-semibold text-ember"
                >
                  <span className="relative flex h-2 w-2" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
                  </span>
                  Register for {featured.name}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              ) : null}
            </motion.div>

            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="mt-14 grid max-w-lg grid-cols-3 gap-7"
            >
              {impactStats.slice(0, 3).map((stat) => (
                <div key={stat.label} className="relative pl-4">
                  <span
                    className="absolute top-1 bottom-1 left-0 w-px"
                    style={{ background: "linear-gradient(180deg,#1f86db,rgba(249,115,22,0.55))" }}
                    aria-hidden
                  />
                  <dt className="font-display text-[1.75rem] leading-none font-semibold tracking-[-0.04em] text-deep tabular">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </dt>
                  <dd className="mt-1.5 text-[12px] leading-snug text-muted">{stat.label}</dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          {/* Cinematic image composition */}
          <div className="relative">
            <motion.div style={{ y: heroY, scale: heroScale }} className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 26 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
                className="edge-gradient relative overflow-hidden rounded-[34px] shadow-[var(--shadow-xl)]"
              >
                <SmartImage
                  src={heroImage}
                  alt={featured?.name ?? "SPIC community"}
                  priority
                  rounded="rounded-[34px]"
                  className="aspect-[4/5] w-full sm:aspect-[5/5.4]"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,23,41,0.1)_0%,transparent_38%,rgba(4,23,41,0.78)_100%)]" />
                <Grain opacity={0.06} />

                {featured ? (
                  <div className="glass-dark absolute inset-x-4 bottom-4 rounded-[22px] p-4 sm:inset-x-5 sm:bottom-5">
                    <div className="flex items-center gap-2">
                      <Badge tone={statusTone(featured.status)} className="bg-white/90">
                        {featured.status === "open" ? "Registrations open" : featured.status}
                      </Badge>
                    </div>
                    <p className="mt-2.5 font-display text-[21px] leading-tight font-semibold text-white">
                      {featured.name}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-white/82">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" /> {formatEventDate(featured.date)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> {featured.venue}
                      </span>
                    </div>
                  </div>
                ) : null}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 1, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-12 -left-6 hidden w-44 overflow-hidden rounded-[24px] border-[5px] border-canvas shadow-[var(--shadow-lg)] sm:block lg:-left-16 lg:w-56"
              >
                <SmartImage src={secondaryImage} alt="SPIC event moment" rounded="rounded-[18px]" className="aspect-[4/3]" />
              </motion.div>

              {countdown && !countdown.isPast ? (
                <motion.div
                  initial={{ opacity: 0, y: -14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.35 }}
                  className="absolute -top-5 -right-2 rounded-[20px] border border-white/80 bg-white/85 px-4 py-3 shadow-[var(--shadow-lg)] backdrop-blur-xl lg:-right-10"
                >
                  <p className="text-[9.5px] font-bold tracking-[0.2em] text-faint uppercase">Starts in</p>
                  <div className="mt-1.5 flex items-baseline gap-2 font-display text-deep">
                    {[
                      { v: countdown.days, l: "d" },
                      { v: countdown.hours, l: "h" },
                      { v: countdown.minutes, l: "m" },
                      { v: countdown.seconds, l: "s" },
                    ].map((unit) => (
                      <span key={unit.l} className="text-[19px] font-semibold tabular">
                        {String(unit.v).padStart(2, "0")}
                        <span className="text-[10.5px] font-medium text-faint">{unit.l}</span>
                      </span>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </motion.div>
          </div>
        </div>

        <div className="shell relative flex items-center gap-3 pb-8 text-[11px] font-bold tracking-[0.2em] text-faint uppercase">
          <MoveDown className="h-4 w-4 animate-bounce text-ember" aria-hidden />
          Scroll to explore
        </div>
      </section>

      {/* ════════════════════ MARQUEE ════════════════════ */}
      <section className="relative border-y border-line bg-surface py-4" aria-hidden>
        <div className="mask-fade-r flex overflow-hidden">
          <div className="animate-marquee flex shrink-0 items-center gap-9 pr-9">
            {[...marqueeWords, ...marqueeWords].map((word, index) => (
              <span key={`${word}-${index}`} className="flex items-center gap-9 whitespace-nowrap">
                <span className="font-display text-[15px] font-semibold tracking-[-0.015em] text-ink/40">{word}</span>
                <span className="h-1 w-1 rounded-full bg-ember/55" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ FEATURED EVENT ════════════════════ */}
      <section className="shell py-20 lg:py-28">
        <SectionHeading
          eyebrow="Live now"
          title={
            <>
              The event everyone on campus is <span className="serif-accent text-brand">talking about</span>
            </>
          }
          description={aboutCopy.connective}
          action={
            <Link to="/events" className={buttonStyles("outline", "md", "rounded-full")}>
              All events
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          }
        />

        <Reveal className="mt-11">
          {isLoading && !featured ? (
            <Skeleton className="h-[28rem] w-full" />
          ) : featured ? (
            <div className="grain-overlay group relative overflow-hidden rounded-[34px] bg-abyss text-white shadow-[var(--shadow-xl)]">
              <SmartImage
                src={eventCover(featured) || photos[3] || COMMUNITY_IMAGE}
                alt={featured.name}
                rounded="rounded-none"
                className="absolute inset-0 h-full w-full"
                imgClassName="opacity-45 transition-transform duration-[1400ms] ease-[var(--ease-out-soft)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(102deg,rgba(4,23,41,0.96)_16%,rgba(6,31,54,0.8)_50%,rgba(4,23,41,0.38)_100%)]" />
              <MeshBackdrop variant="deep" className="opacity-60 mix-blend-screen" />
              <div className="vignette pointer-events-none absolute inset-0 rounded-[34px]" />

              <div className="relative grid gap-10 p-7 sm:p-12 lg:grid-cols-[1.24fr_0.76fr] lg:items-end lg:p-16">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-[linear-gradient(135deg,#f97316,#ffb454)] text-white ring-white/25">
                      Featured
                    </Badge>
                    <Badge className="bg-white/12 text-white ring-white/22">{featured.category}</Badge>
                    <Badge className="bg-white/12 text-white ring-white/22">{featured.status}</Badge>
                  </div>
                  <h3 className="mt-6 text-[clamp(2.1rem,5.2vw,3.9rem)] leading-[0.96] font-semibold tracking-[-0.045em]">
                    {featured.name}
                  </h3>
                  <p className="mt-5 max-w-xl text-[15.5px] leading-[1.7] text-white/78">{featured.description}</p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    {featured.status === "open" ? (
                      <Link to={`/register/${featured.id}`} className={buttonStyles("ember", "lg")}>
                        <span className="relative z-10 inline-flex items-center gap-2.5">
                          Register now
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </Link>
                    ) : null}
                    <Link to="/events" className={buttonStyles("glass", "lg")}>
                      Event details
                    </Link>
                  </div>

                  {featured.notes?.filter(Boolean).length ? (
                    <ul className="mt-8 flex flex-wrap gap-2">
                      {featured.notes.filter(Boolean).map((note, index) => (
                        <li
                          key={index}
                          className="glass-dark flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium text-white/90"
                        >
                          <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-[linear-gradient(135deg,#f97316,#ffb454)] text-[9px] font-bold text-white">
                            {index + 1}
                          </span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <dl className="glass-dark grid grid-cols-2 gap-x-6 gap-y-5 rounded-[24px] p-6 lg:grid-cols-1">
                  {[
                    { label: "Date", value: formatEventDate(featured.date) },
                    { label: "Time", value: featured.time ?? "To be announced" },
                    { label: "Venue", value: featured.venue },
                    {
                      label: "Format",
                      value:
                        featured.registrationType === "team"
                          ? `Team of ${featured.minTeamSize ?? 1}–${featured.maxTeamSize ?? 4}`
                          : "Individual entry",
                    },
                  ].map((row) => (
                    <div key={row.label}>
                      <dt className="text-[10px] font-bold tracking-[0.2em] text-sky/80 uppercase">{row.label}</dt>
                      <dd className="mt-1 text-[15px] font-medium text-white">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ) : null}
        </Reveal>

        {upcoming.length ? (
          <StaggerList className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <StaggerItem key={event.id} className="h-full">
                <EventCard event={event} />
              </StaggerItem>
            ))}
          </StaggerList>
        ) : null}
      </section>

      {/* ════════════════════ SCROLL STORY ════════════════════ */}
      <section ref={storyRef} className="relative overflow-hidden border-y border-line bg-surface py-20 lg:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Inside the ecosystem"
            title={
              <>
                A campus that ships ideas, <span className="serif-accent text-ember">not just slides</span>
              </>
            }
            description={aboutCopy.ecosystem}
          />
        </div>

        <div className="mask-fade-r mt-12 space-y-5">
          <motion.div style={{ x: railX }} className="flex gap-5 will-change-transform">
            {(photos.length ? photos : Array.from({ length: 6 }, () => "")).slice(0, 8).map((photo, index) => (
              <div
                key={`rail-a-${index}`}
                className={`relative shrink-0 overflow-hidden rounded-[24px] shadow-[var(--shadow-md)] ${
                  index % 3 === 1 ? "h-64 w-[22rem] sm:h-[21rem] sm:w-[34rem]" : "h-64 w-64 sm:h-[21rem] sm:w-[22rem]"
                }`}
              >
                <SmartImage src={photo} alt={`SPIC moment ${index + 1}`} rounded="rounded-[24px]" className="h-full w-full" />
              </div>
            ))}
          </motion.div>

          <motion.div style={{ x: railXAlt }} className="flex gap-5 will-change-transform">
            {(photos.length ? [...photos].reverse() : Array.from({ length: 6 }, () => "")).slice(0, 8).map((photo, index) => (
              <div
                key={`rail-b-${index}`}
                className={`relative shrink-0 overflow-hidden rounded-[24px] shadow-[var(--shadow-md)] ${
                  index % 4 === 2 ? "h-52 w-[20rem] sm:h-[17rem] sm:w-[30rem]" : "h-52 w-52 sm:h-[17rem] sm:w-[18rem]"
                }`}
              >
                <SmartImage src={photo} alt={`SPIC moment ${index + 9}`} rounded="rounded-[24px]" className="h-full w-full" />
              </div>
            ))}
          </motion.div>
        </div>

        <div className="shell mt-12 flex justify-center">
          <Link to="/gallery" className={buttonStyles("outline", "lg", "rounded-full")}>
            Enter the gallery
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ════════════════════ WHAT WE DO ════════════════════ */}
      <section className="shell py-20 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[0.88fr_1.12fr]">
          <Reveal direction="right">
            <p className="eyebrow">
              <span className="inline-block h-px w-6 bg-brand/45" aria-hidden />
              What we do
            </p>
            <h2 className="mt-3.5 text-[clamp(2rem,4.4vw,3.2rem)] leading-[1] font-semibold tracking-[-0.045em] text-ink">
              Four ways SPIC turns curiosity into <span className="serif-accent text-brand">momentum</span>
            </h2>
            <p className="mt-5 max-w-md text-[15.5px] leading-[1.7] text-muted">{aboutCopy.whoWeAre}</p>
            <Link to="/about" className={buttonStyles("primary", "md", "mt-8")}>
              <span className="relative z-10 inline-flex items-center gap-2">
                Read our story
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>

            <div className="edge-gradient relative mt-10 hidden overflow-hidden rounded-[28px] shadow-[var(--shadow-lg)] lg:block">
              <SmartImage src={tertiaryImage} alt="SPIC students collaborating" rounded="rounded-[28px]" className="aspect-[4/3]" />
              <Grain opacity={0.05} />
            </div>
          </Reveal>

          <StaggerList className="grid gap-5 sm:grid-cols-2">
            {featureCards.map((card, index) => {
              const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];
              return (
                <StaggerItem key={card.key} className="h-full">
                  <Spotlight
                    as="article"
                    className="group h-full rounded-[24px] border border-line bg-surface p-7 shadow-[var(--shadow-sm)] transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:border-brand/25 hover:shadow-[var(--shadow-lg)]"
                  >
                    <span
                      className={`relative z-10 grid h-12 w-12 place-items-center rounded-[16px] bg-gradient-to-br ${FEATURE_TINTS[index % FEATURE_TINTS.length]} shadow-[var(--shadow-inset)] transition-transform duration-300 group-hover:scale-105`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="relative z-10 mt-6 font-display text-[18.5px] leading-snug font-semibold text-ink">
                      {card.title}
                    </h3>
                    <p className="relative z-10 mt-2.5 text-[14.5px] leading-relaxed text-muted">{card.desc}</p>
                  </Spotlight>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </div>
      </section>

      {/* ════════════════════ IMPACT (warm editorial) ════════════════════ */}
      <section className="relative overflow-hidden border-y border-linen bg-sand py-20 lg:py-24">
        <MeshBackdrop variant="warm" className="opacity-55" />
        <div className="shell relative">
          <SectionHeading
            eyebrow="Impact"
            title={
              <>
                Numbers that keep <span className="serif-accent text-ember">compounding</span>
              </>
            }
            align="center"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {impactStats.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 0.07}>
                <Spotlight className="h-full rounded-[24px] border border-white/80 bg-white/72 p-7 text-center shadow-[var(--shadow-sm)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                  <p className="relative z-10 font-display text-[2.7rem] leading-none font-semibold tracking-[-0.05em] text-deep tabular">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="relative z-10 mt-3 text-[14px] font-semibold text-ink">{stat.label}</p>
                  <p className="relative z-10 mt-1 text-[12.5px] text-muted">{stat.sub}</p>
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ CLOSING CTA ════════════════════ */}
      <section className="shell py-20 lg:py-28">
        <Reveal>
          <div className="grain-overlay relative overflow-hidden rounded-[36px] bg-abyss px-7 py-14 text-white shadow-[var(--shadow-xl)] sm:px-14 lg:px-20 lg:py-20">
            <MeshBackdrop variant="deep" className="opacity-80" />
            <div className="vignette pointer-events-none absolute inset-0 rounded-[36px]" />

            <div className="relative grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
              <div>
                <p className="text-[10.5px] font-bold tracking-[0.24em] text-sky uppercase">Join the cell</p>
                <h2 className="mt-5 text-[clamp(2.1rem,4.8vw,3.5rem)] leading-[0.98] font-semibold tracking-[-0.045em]">
                  Your idea deserves a room full of <span className="serif-accent text-amber">builders.</span>
                </h2>
                <p className="mt-6 max-w-xl text-[15.5px] leading-[1.7] text-white/72">{aboutCopy.quote}</p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link to="/join" className={buttonStyles("ember", "lg")}>
                    <span className="relative z-10 inline-flex items-center gap-2.5">
                      Join the team
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                  <Link to="/team" className={buttonStyles("glass", "lg")}>
                    Meet the people
                  </Link>
                </div>
              </div>

              <div className="relative hidden sm:block">
                <div className="absolute -top-8 -left-8 h-40 w-40 rotate-[-7deg] overflow-hidden rounded-[24px] border-4 border-white/18 shadow-[var(--shadow-lg)]">
                  <SmartImage src={photos[4] || COMMUNITY_IMAGE} alt="SPIC team" rounded="rounded-[20px]" className="h-full w-full" />
                </div>
                <div className="ml-16 overflow-hidden rounded-[28px] border-4 border-white/18 shadow-[var(--shadow-lg)]">
                  <SmartImage src={photos[5] || secondaryImage} alt="SPIC event" rounded="rounded-[24px]" className="aspect-[4/3]" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
