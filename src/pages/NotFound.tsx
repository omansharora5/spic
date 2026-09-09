import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { GridField, MeshBackdrop } from "@/components/site/Atmosphere";
import { buttonStyles } from "@/components/ui/kit";

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-5 py-20 text-center">
      <MeshBackdrop variant="light" className="opacity-80" />
      <GridField />
      <span className="relative grid h-16 w-16 place-items-center rounded-[20px] bg-gradient-to-br from-[#E6F4FF] to-[#D2EBFF] text-brand shadow-[var(--shadow-inset)]">
        <Compass className="h-7 w-7" />
      </span>
      <p className="gradient-text relative mt-8 font-display text-[clamp(4rem,14vw,9rem)] leading-none font-semibold tracking-[-0.06em]">
        404
      </p>
      <h1 className="mt-2 font-display text-[24px] font-semibold text-ink">This page has not been built yet</h1>
      <p className="mt-3 max-w-md text-[15px] text-muted">
        <code className="rounded bg-mist px-1.5 py-0.5 text-[13px] text-deep">{pathname}</code> does not exist in the
        SPIC workspace. Let's get you back to something useful.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className={buttonStyles("primary", "md")}>
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
        <Link to="/events" className={buttonStyles("outline", "md")}>
          See events
        </Link>
      </div>
    </div>
  );
}
