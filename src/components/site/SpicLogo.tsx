import { useState } from "react";
import { assetUrl } from "@/lib/media";
import { cn } from "@/utils/cn";

/**
 * Official SPIC logo from the project's public assets.
 * Falls back to the typographic monogram if the asset is unavailable.
 */
export default function SpicLogo({ className, imgClassName }: { className?: string; imgClassName?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-[12px] bg-[linear-gradient(135deg,#041729_0%,#0b3b66_38%,#1f86db_78%,#f97316_150%)] font-display text-[13px] font-bold tracking-[-0.05em] text-white",
          className,
        )}
      >
        SP
      </span>
    );
  }

  return (
    <img
      src={assetUrl("https://i.postimg.cc/CxPBVpz0/spic-logo.webp")}
      alt="SPIC — Society for Promotion of Innovation and Creativity, RKGIT"
      onError={() => setFailed(true)}
      loading="eager"
      decoding="async"
      className={cn("h-9 w-9 object-contain", className, imgClassName)}
    />
  );
}
