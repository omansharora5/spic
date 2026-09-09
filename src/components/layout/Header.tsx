import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { buttonStyles } from "@/components/ui/kit";
import SpicLogo from "@/components/site/SpicLogo";
import { cn } from "@/utils/cn";

const NAV = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Events", path: "/events" },
  { label: "Gallery", path: "/gallery" },
  { label: "Team", path: "/team" },
];

export function SpicMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="group/mark flex items-center gap-2.5">
      <SpicLogo className="h-9 w-9 transition-transform duration-300 ease-[var(--ease-spring)] group-hover/mark:scale-105" />
      {!compact ? (
        <span className="leading-tight">
          <span className="block font-display text-[15.5px] font-bold tracking-[-0.04em] text-ink">SPIC</span>
          <span className="block text-[9.5px] font-semibold tracking-[0.18em] text-faint uppercase">RKGIT</span>
        </span>
      ) : null}
    </span>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();

  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 16));
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[120] focus:rounded-full focus:bg-deep focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
        <div className="shell">
          <motion.div
            initial={false}
            animate={{
              backgroundColor: scrolled ? "rgba(255,255,255,0.86)" : "rgba(255,255,255,0.58)",
              boxShadow: scrolled
                ? "inset 0 1px 0 rgba(255,255,255,0.85), 0 18px 44px -24px rgba(7,46,79,0.45)"
                : "inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 28px -22px rgba(7,46,79,0.32)",
              borderColor: scrolled ? "rgba(198,220,234,0.95)" : "rgba(224,236,244,0.6)",
            }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between gap-3 rounded-[20px] border px-3 py-2 backdrop-blur-2xl backdrop-saturate-150 sm:px-4"
          >
            <Link to="/" aria-label="SPIC home" className="shrink-0 rounded-xl px-1 py-1">
              <SpicMark />
            </Link>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
              {NAV.map((item) => (
                <NavLink key={item.path} to={item.path} end={item.path === "/"} className="relative px-3.5 py-2">
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#e6f4ff,#f4fafe)] ring-1 ring-brand/12 ring-inset"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      ) : null}
                      <span
                        className={cn(
                          "relative text-[13.5px] font-semibold transition-colors",
                          isActive ? "text-deep" : "text-muted hover:text-ink",
                        )}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link to="/join" className={buttonStyles("ember", "sm", "hidden rounded-full px-4 sm:inline-flex")}>
                Join SPIC
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-ink transition hover:border-line-strong md:hidden"
              >
                {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-deep/25 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.nav
              aria-label="Mobile navigation"
              initial={{ y: -18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-4 top-20 overflow-hidden rounded-[22px] border border-line bg-surface p-3 shadow-[var(--shadow-lg)]"
            >
              {NAV.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between rounded-md px-4 py-3.5 text-[15px] font-semibold transition",
                      isActive ? "bg-ice text-deep" : "text-ink hover:bg-mist",
                    )
                  }
                >
                  {item.label}
                  <ArrowUpRight className="h-4 w-4 opacity-40" />
                </NavLink>
              ))}
              <Link to="/join" className={buttonStyles("ember", "md", "mt-3 w-full")}>
                Join SPIC
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
