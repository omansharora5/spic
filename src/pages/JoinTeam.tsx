import { Link } from "react-router-dom";
import { ArrowUpRight, Clock3, Sparkles } from "lucide-react";
import Reveal, { StaggerItem, StaggerList } from "@/components/site/Reveal";
import SmartImage from "@/components/site/SmartImage";
import { GridField, MeshBackdrop, Spotlight } from "@/components/site/Atmosphere";
import { Badge, buttonStyles, SectionHeading } from "@/components/ui/kit";
import { joinBenefits, aboutCopy } from "@/data/content";
import { useGallery } from "@/hooks/useSpicData";

const COMMUNITY_IMAGE = "https://i.postimg.cc/HsBnfz1y/spic-community.jpg";

const DEPARTMENTS = ["Events & Operations", "Technical", "Design & Media", "Public Relations", "Content", "Finance"];

export default function JoinTeam() {
  const { albums } = useGallery();
  const photos = albums.flatMap((album) => album.images);

  return (
    <>
      <section className="relative overflow-hidden">
        <MeshBackdrop variant="light" className="-top-36" />
        <GridField />
        <div className="shell relative grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/70 bg-white/70 py-1.5 pr-4 pl-1.5 shadow-[var(--shadow-sm)] backdrop-blur-xl">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[linear-gradient(135deg,#f97316,#ffb454)] text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11.5px] font-bold tracking-[0.16em] text-deep uppercase">Join SPIC</span>
            </span>

            <h1 className="mt-7 text-[clamp(2.5rem,6.4vw,4.8rem)] leading-[0.94] font-semibold tracking-[-0.05em] text-ink">
              Become part of the <span className="serif-accent gradient-text">SPIC family.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-muted">{aboutCopy.connective}</p>

            <div className="mt-8 inline-flex items-center gap-3 rounded-[18px] border border-brand/20 bg-ice px-5 py-4">
              <span className="relative flex h-3 w-3" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-70" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-brand" />
              </span>
              <div>
                <p className="text-[14.5px] font-semibold text-deep">Applications open soon</p>
                <p className="text-[13px] text-muted">
                  We are working behind the scenes to bring you the next recruitment drive. Stay tuned.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://www.instagram.com/spic_rkgit?igsh=MWowamxuMTd6aWh6Zg=="
                target="_blank"
                rel="noreferrer"
                className={buttonStyles("primary", "lg")}
              >
                Follow for the announcement
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <Link to="/events" className={buttonStyles("outline", "lg")}>
                Attend an event first
              </Link>
            </div>
          </div>

          <Reveal direction="left" className="relative">
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <SmartImage src={photos[0] || COMMUNITY_IMAGE} alt="SPIC team at work" rounded="rounded-[22px]" className="aspect-[3/4] border border-line" />
                <SmartImage src={photos[3] || COMMUNITY_IMAGE} alt="SPIC crew" rounded="rounded-[22px]" className="aspect-square border border-line" />
              </div>
              <div className="space-y-4 pt-10">
                <SmartImage src={photos[1] || COMMUNITY_IMAGE} alt="SPIC event floor" rounded="rounded-[22px]" className="aspect-square border border-line" />
                <SmartImage src={photos[2] || COMMUNITY_IMAGE} alt="SPIC on stage" rounded="rounded-[22px]" className="aspect-[3/4] border border-line" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="shell py-16 lg:py-24">
        <SectionHeading eyebrow="Why join" title="What you get inside the cell" />
        <StaggerList className="mt-10 grid gap-5 md:grid-cols-3">
          {joinBenefits.map((benefit) => (
            <StaggerItem key={benefit.title} className="h-full">
              <Spotlight
                as="article"
                className="h-full rounded-[24px] border border-line bg-surface p-7 shadow-[var(--shadow-sm)] transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:border-brand/25 hover:shadow-[var(--shadow-lg)]"
              >
                <h3 className="relative z-10 font-display text-[19px] font-semibold text-ink">{benefit.title}</h3>
                <p className="relative z-10 mt-3 text-[14.5px] leading-relaxed text-muted">{benefit.desc}</p>
              </Spotlight>
            </StaggerItem>
          ))}
        </StaggerList>
      </section>

      <section className="border-y border-line bg-surface py-16 lg:py-20">
        <div className="shell">
          <SectionHeading
            eyebrow="Departments"
            title="Pick the vertical you want to own"
            description="Every SPIC member belongs to a department and contributes to campus-scale programmes."
          />
          <div className="mt-9 flex flex-wrap gap-2.5">
            {DEPARTMENTS.map((department) => (
              <Badge key={department} tone="neutral" className="px-4 py-2 text-[12.5px] normal-case tracking-normal">
                {department}
              </Badge>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start gap-4 rounded-[24px] border border-line bg-mist p-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-surface text-brand">
                <Clock3 className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-[17px] font-semibold text-ink">Recruitment window: announced soon</p>
                <p className="mt-1 text-[14px] text-muted">
                  Until then, meet the current team and see what we are building.
                </p>
              </div>
            </div>
            <Link to="/team" className={buttonStyles("primary", "md")}>
              Meet the team <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
