import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Users } from "lucide-react";
import SmartImage from "@/components/site/SmartImage";
import Reveal from "@/components/site/Reveal";
import { GridField, MeshBackdrop } from "@/components/site/Atmosphere";
import { Badge, buttonStyles, EmptyState, Input, SectionHeading, Skeleton } from "@/components/ui/kit";
import type { TeamMemberDoc } from "@/services/firebaseTeam";
import { useTeamMembers } from "@/hooks/useSpicData";
import { cn } from "@/utils/cn";

const LinkedInGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M4.98 3.5A2.5 2.5 0 1 1 2.5 6 2.49 2.49 0 0 1 4.98 3.5ZM3 8.98h4V21H3ZM9.5 8.98h3.83v1.64h.05a4.2 4.2 0 0 1 3.78-2.08c4 0 4.84 2.63 4.84 6.05V21h-4v-5.5c0-1.31 0-3-1.83-3s-2.11 1.43-2.11 2.9V21h-4Z" />
  </svg>
);

function isFaculty(member: TeamMemberDoc) {
  return member.category === "faculty" || /dean|faculty|professor/i.test(member.role ?? "");
}

function MemberCard({ member, large = false }: { member: TeamMemberDoc; large?: boolean }) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[24px] border border-line bg-surface shadow-[var(--shadow-sm)]",
        "transition-all duration-350 ease-[var(--ease-out-soft)] hover:-translate-y-2 hover:border-brand/25 hover:shadow-[var(--shadow-lg)]",
      )}
    >
      <SmartImage
        src={member.image}
        alt={member.name}
        objectPosition={member.objectPosition}
        rounded="rounded-none"
        className={large ? "aspect-[4/5]" : "aspect-[4/5]"}
        imgClassName="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.05]"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-[linear-gradient(180deg,transparent_0%,rgba(4,23,41,0.28)_42%,rgba(4,23,41,0.92)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="font-display text-[16.5px] leading-tight font-semibold text-white">{member.name.trim()}</p>
        <p className="mt-0.5 text-[12px] font-medium tracking-[0.06em] text-white/75 uppercase">{member.role}</p>
        {member.linkedinUrl && member.linkedinUrl !== "#" ? (
          <a
            href={member.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`${member.name} on LinkedIn`}
            className="mt-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-deep opacity-0 transition-all duration-300 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <LinkedInGlyph className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default function Team() {
  const { members, isLoading } = useTeamMembers();
  const [query, setQuery] = useState("");

  const faculty = useMemo(() => members.filter(isFaculty), [members]);
  const rest = useMemo(() => members.filter((member) => !isFaculty(member)), [members]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rest;
    return rest.filter((member) => `${member.name} ${member.role} ${member.department ?? ""}`.toLowerCase().includes(term));
  }, [rest, query]);

  return (
    <>
      <section className="relative overflow-hidden">
        <MeshBackdrop variant="light" className="-top-36" />
        <GridField />
        <div className="shell relative py-16 lg:py-20">
          <p className="eyebrow">
            <span className="inline-block h-px w-6 bg-brand/45" aria-hidden />
            The people
          </p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.4rem,6.2vw,4.6rem)] leading-[0.94] font-semibold tracking-[-0.05em] text-ink">
            The team behind every <span className="serif-accent gradient-text">SPIC build.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted">
            Faculty mentors, core leadership and department heads working across events, tech, design, PR and operations.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Badge tone="blue">
              <Users className="h-3.5 w-3.5" /> {members.length} members
            </Badge>
            <Link to="/join" className={buttonStyles("ember", "sm")}>
              Apply to join <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {faculty.length ? (
        <section className="shell pb-10">
          <Reveal>
            <div className="edge-gradient grid gap-8 overflow-hidden rounded-[30px] bg-[linear-gradient(118deg,#FFFFFF_0%,#F4FAFE_58%,#FFF3EA_100%)] p-6 shadow-[var(--shadow-md)] sm:grid-cols-[minmax(0,16rem)_1fr] sm:p-9">
              <SmartImage
                src={faculty[0].image}
                alt={faculty[0].name}
                objectPosition={faculty[0].objectPosition}
                rounded="rounded-[20px]"
                className="aspect-[4/5] w-full"
                priority
              />
              <div className="flex flex-col justify-center">
                <Badge tone="ember">Faculty advisor</Badge>
                <h2 className="mt-4 font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight font-semibold tracking-[-0.03em] text-ink">
                  {faculty[0].name}
                </h2>
                <p className="mt-1.5 text-[14px] font-semibold tracking-[0.08em] text-brand uppercase">
                  {faculty[0].role}
                  {faculty[0].department ? ` · ${faculty[0].department}` : ""}
                </p>
                {faculty[0].bio ? <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-muted">{faculty[0].bio}</p> : null}
              </div>
            </div>
          </Reveal>
        </section>
      ) : null}

      <section className="shell py-12 lg:py-16">
        <SectionHeading
          eyebrow="Core & departments"
          title="Meet the crew"
          action={
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or role"
              aria-label="Search team members"
              className="w-full sm:w-64"
            />
          }
        />

        {isLoading && !members.length ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/5]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10">
            <EmptyState icon={<Users className="h-7 w-7" />} title="No members match that search" />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-5">
            {filtered.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
