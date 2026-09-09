import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Compass, Quote, Target } from "lucide-react";
import Reveal, { StaggerItem, StaggerList } from "@/components/site/Reveal";
import SmartImage from "@/components/site/SmartImage";
import Counter from "@/components/site/Counter";
import { Grain, GridField, MeshBackdrop, Spotlight } from "@/components/site/Atmosphere";
import { buttonStyles, SectionHeading } from "@/components/ui/kit";
import { aboutCopy, aboutStats, brand } from "@/data/content";
import { timelineData } from "@/data/timeline";
import { useGallery, usePrefersReducedMotion } from "@/hooks/useSpicData";

const COMMUNITY_IMAGE = "https://i.postimg.cc/HsBnfz1y/spic-community.jpg";

export default function About() {
  const { albums } = useGallery();
  const photos = albums.flatMap((album) => album.images);
  const reduced = usePrefersReducedMotion();

  const storyRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: storyRef, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["8%", "-8%"]);

  return (
    <>
      <section className="relative overflow-hidden">
        <MeshBackdrop variant="light" className="-top-36" />
        <GridField />
        <div className="shell relative py-16 lg:py-24">
          <p className="eyebrow">
            <span className="inline-block h-px w-6 bg-brand/45" aria-hidden />
            About SPIC
          </p>
          <h1 className="mt-4 max-w-4xl text-[clamp(2.5rem,6.6vw,5rem)] leading-[0.94] font-semibold tracking-[-0.05em] text-ink">
            A student-run society turning ideas into <span className="serif-accent gradient-text">real ventures.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[16.5px] leading-relaxed text-muted">{aboutCopy.whoWeAre}</p>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <div className="edge-gradient relative overflow-hidden rounded-[28px] shadow-[var(--shadow-lg)] sm:col-span-2">
              <SmartImage src={photos[0] || COMMUNITY_IMAGE} alt="SPIC community" priority rounded="rounded-[28px]" className="aspect-[16/9]" />
              <Grain opacity={0.05} />
            </div>
            <div className="edge-gradient relative overflow-hidden rounded-[28px] shadow-[var(--shadow-lg)]">
              <SmartImage src={photos[1] || COMMUNITY_IMAGE} alt="SPIC session" rounded="rounded-[28px]" className="h-full min-h-52" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="shell py-16 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            { icon: Target, label: "Our mission", body: aboutCopy.mission },
            { icon: Compass, label: "Our vision", body: aboutCopy.visionShort },
          ].map((item, index) => (
            <Reveal key={item.label} delay={index * 0.08}>
              <Spotlight
                as="article"
                className="h-full rounded-[28px] border border-line bg-surface p-8 shadow-[var(--shadow-sm)] transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:border-brand/25 hover:shadow-[var(--shadow-lg)]"
              >
                <span
                  className={`relative z-10 grid h-12 w-12 place-items-center rounded-[16px] shadow-[var(--shadow-inset)] ${
                    index === 0 ? "bg-gradient-to-br from-[#E6F4FF] to-[#D2EBFF] text-brand" : "bg-gradient-to-br from-[#FFF3EA] to-[#FFE3CE] text-ember"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                </span>
                <h2 className="relative z-10 mt-6 font-display text-[22px] font-semibold text-ink">{item.label}</h2>
                <p className="relative z-10 mt-3 text-[15.5px] leading-relaxed text-muted">{item.body}</p>
              </Spotlight>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-6">
          <blockquote className="edge-gradient relative overflow-hidden rounded-[28px] bg-[linear-gradient(118deg,#E6F4FF_0%,#FFFFFF_46%,#FFF3EA_100%)] p-8 shadow-[var(--shadow-md)] lg:p-14">
            <Quote className="h-8 w-8 text-ember" aria-hidden />
            <p className="serif-accent mt-5 max-w-3xl text-[clamp(1.45rem,3vw,2.3rem)] leading-[1.22] text-deep">
              {aboutCopy.quote}
            </p>
            <footer className="mt-5 text-[13px] font-semibold tracking-[0.14em] text-muted uppercase">
              {brand.full} · {brand.parent}
            </footer>
          </blockquote>
        </Reveal>
      </section>

      {/* Story with parallax */}
      <section ref={storyRef} className="border-y border-line bg-surface py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <Reveal direction="right">
            <SectionHeading eyebrow="The entrepreneurship story" title="Built by students, backed by industry" />
            <p className="mt-5 text-[15.5px] leading-relaxed text-muted">{aboutCopy.vision}</p>
            <p className="mt-4 text-[15.5px] leading-relaxed text-muted">{aboutCopy.connective}</p>
            <Link to="/events" className={buttonStyles("primary", "md", "mt-7")}>
              See what we run
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <div className="relative grid grid-cols-2 gap-4">
            <motion.div style={{ y: imageY }} className="space-y-4">
              <SmartImage src={photos[2] || COMMUNITY_IMAGE} alt="SPIC workshop" rounded="rounded-[22px]" className="aspect-[3/4] border border-line" />
              <SmartImage src={photos[3] || COMMUNITY_IMAGE} alt="SPIC talk" rounded="rounded-[22px]" className="aspect-square border border-line" />
            </motion.div>
            <div className="space-y-4 pt-10">
              <SmartImage src={photos[4] || COMMUNITY_IMAGE} alt="SPIC audience" rounded="rounded-[22px]" className="aspect-square border border-line" />
              <SmartImage src={photos[5] || COMMUNITY_IMAGE} alt="SPIC stage" rounded="rounded-[22px]" className="aspect-[3/4] border border-line" />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="shell py-16 lg:py-24">
        <SectionHeading eyebrow="Timeline" title={`Milestones since ${brand.since}`} description="Every year the cell has expanded what students can build on campus." />
        <StaggerList className="relative mt-12 space-y-3">
          <span className="absolute top-2 bottom-2 left-[6.2rem] hidden w-px bg-line md:block" aria-hidden />
          {timelineData.map((item) => (
            <StaggerItem key={item.year}>
              <div className="group grid gap-4 rounded-[22px] border border-transparent p-5 transition-all hover:border-line hover:bg-surface md:grid-cols-[6rem_1fr] md:gap-10">
                <div className="flex items-start gap-4">
                  <span className="font-display text-[28px] leading-none font-semibold tracking-[-0.04em] text-deep">
                    {item.year}
                  </span>
                </div>
                <ul className="relative space-y-2">
                  {item.events.map((entry) => (
                    <li key={entry} className="flex items-start gap-3 text-[15px] text-ink/85">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" aria-hidden />
                      {entry}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </section>

      {/* Impact */}
      <section className="relative overflow-hidden border-t border-linen bg-sand py-16 lg:py-24">
        <MeshBackdrop variant="warm" className="opacity-50" />
        <div className="shell relative">
          <SectionHeading eyebrow="Impact" title="What the cell has delivered" align="center" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {aboutStats.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 0.06}>
                <Spotlight className="h-full rounded-[24px] border border-white/80 bg-white/72 p-7 text-center shadow-[var(--shadow-sm)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                  <p className="relative z-10 font-display text-[2.5rem] leading-none font-semibold tracking-[-0.05em] text-deep tabular">
                    <Counter value={stat.number} suffix={stat.suffix} />
                  </p>
                  <p className="relative z-10 mt-3 text-[14px] font-semibold text-ink">{stat.label}</p>
                  <p className="relative z-10 mt-1 text-[12.5px] text-muted">{stat.sub}</p>
                </Spotlight>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap justify-center gap-3">
            <Link to="/join" className={buttonStyles("ember", "lg")}>
              Join SPIC
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/gallery" className={buttonStyles("outline", "lg")}>
              Browse the gallery
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
