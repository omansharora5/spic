import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SpicMark } from "./Header";
import { GlowRule, MeshBackdrop } from "@/components/site/Atmosphere";
import { buttonStyles } from "@/components/ui/kit";

const iconProps = { viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true } as const;

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg {...iconProps} className={className}>
    <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4Zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3Zm6.9-11.1a1.5 1.5 0 1 1-1.6-1.6 1.5 1.5 0 0 1 1.6 1.6Z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg {...iconProps} className={className}>
    <path d="M4.98 3.5A2.5 2.5 0 1 1 2.5 6 2.49 2.49 0 0 1 4.98 3.5ZM3 8.98h4V21H3ZM9.5 8.98h3.83v1.64h.05a4.2 4.2 0 0 1 3.78-2.08c4 0 4.84 2.63 4.84 6.05V21h-4v-5.5c0-1.31 0-3-1.83-3s-2.11 1.43-2.11 2.9V21h-4Z" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg {...iconProps} className={className}>
    <path d="M23 12s0-3.5-.45-5.17a2.9 2.9 0 0 0-2-2.06C18.7 4.25 12 4.25 12 4.25s-6.7 0-8.55.52a2.9 2.9 0 0 0-2 2.06A29.3 29.3 0 0 0 1 12a29.3 29.3 0 0 0 .45 5.17 2.9 2.9 0 0 0 2 2.06c1.85.52 8.55.52 8.55.52s6.7 0 8.55-.52a2.9 2.9 0 0 0 2-2.06C23 15.5 23 12 23 12ZM9.8 15.3V8.7l5.7 3.3Z" />
  </svg>
);

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/spic_rkgit?igsh=MWowamxuMTd6aWh6Zg==", icon: InstagramIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/spic-eii-695892402/", icon: LinkedinIcon },
  { label: "YouTube", href: "https://www.youtube.com/@spicrkgit?app=desktop", icon: YoutubeIcon },
];

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Home", to: "/" },
      { label: "About", to: "/about" },
      { label: "Events", to: "/events" },
      { label: "Gallery", to: "/gallery" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Team", to: "/team" },
      { label: "Join the team", to: "/join" },
      { label: "Events", to: "/events" },
      { label: "Gallery", to: "/gallery" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-surface">
      <MeshBackdrop variant="light" className="top-0 h-80 opacity-70" animated={false} />
      <GlowRule className="absolute inset-x-0 top-0" />

      <div className="shell relative py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <SpicMark />
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-muted">
              The Entrepreneur Cell of RKGIT — promoting innovation and creativity since 2022.
            </p>
            <p className="gradient-text mt-6 font-display text-[13px] font-bold tracking-[0.3em] uppercase">
              Build · Create · Launch
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-[11px] font-bold tracking-[0.2em] text-muted uppercase">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center gap-1.5 text-[14.5px] text-ink/80 transition hover:text-brand"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-muted uppercase">Get involved</p>
            <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
              Applications, event updates and campus builds — straight from the cell.
            </p>
            <Link to="/join" className={buttonStyles("primary", "md", "mt-5 w-full sm:w-auto")}>
              Join the team
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted transition hover:-translate-y-0.5 hover:border-brand/40 hover:bg-ice hover:text-deep"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} SPIC – The Entrepreneur Cell of RKGIT | RKGIT</p>
          <p className="tracking-[0.14em] uppercase">Ghaziabad · India</p>
        </div>
      </div>
    </footer>
  );
}
