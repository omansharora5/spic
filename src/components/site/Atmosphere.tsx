import { useCallback, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * Ambient mesh backdrop — a few slowly drifting, heavily blurred colour fields.
 * GPU-friendly (transform/opacity only) and static under reduced motion.
 */
export function MeshBackdrop({
  variant = "light",
  className,
  animated = true,
}: {
  variant?: "light" | "deep" | "warm";
  className?: string;
  animated?: boolean;
}) {
  const blobs =
    variant === "deep"
      ? [
          { c: "rgba(71,168,242,0.42)", pos: "top-[-18%] left-[-12%]", size: "h-[34rem] w-[34rem]", delay: "0s" },
          { c: "rgba(249,115,22,0.34)", pos: "top-[6%] right-[-14%]", size: "h-[30rem] w-[30rem]", delay: "-7s" },
          { c: "rgba(97,114,243,0.3)", pos: "bottom-[-22%] left-[28%]", size: "h-[32rem] w-[32rem]", delay: "-14s" },
        ]
      : variant === "warm"
        ? [
            { c: "rgba(255,180,84,0.42)", pos: "top-[-16%] left-[6%]", size: "h-[28rem] w-[28rem]", delay: "0s" },
            { c: "rgba(244,135,158,0.28)", pos: "top-[10%] right-[-10%]", size: "h-[26rem] w-[26rem]", delay: "-9s" },
            { c: "rgba(127,208,251,0.34)", pos: "bottom-[-18%] left-[34%]", size: "h-[30rem] w-[30rem]", delay: "-15s" },
          ]
        : [
            { c: "rgba(127,208,251,0.55)", pos: "top-[-20%] left-[-10%]", size: "h-[36rem] w-[36rem]", delay: "0s" },
            { c: "rgba(249,115,22,0.2)", pos: "top-[-8%] right-[-12%]", size: "h-[30rem] w-[30rem]", delay: "-8s" },
            { c: "rgba(97,114,243,0.2)", pos: "bottom-[-26%] left-[38%]", size: "h-[34rem] w-[34rem]", delay: "-16s" },
            { c: "rgba(45,212,191,0.16)", pos: "bottom-[-10%] left-[-8%]", size: "h-[26rem] w-[26rem]", delay: "-4s" },
          ];

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {blobs.map((blob, index) => (
        <span
          key={index}
          className={cn(
            "absolute rounded-full blur-[90px]",
            blob.pos,
            blob.size,
            animated && "animate-drift",
          )}
          style={{ background: blob.c, animationDelay: blob.delay }}
        />
      ))}
    </div>
  );
}

/** Fine film grain — adds tactile depth on large flat surfaces. */
export function Grain({ opacity = 0.05, className }: { opacity?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 mix-blend-overlay", className)}
      style={{ backgroundImage: "var(--noise)", opacity }}
    />
  );
}

/** Subtle blueprint grid, masked to fade at the edges. */
export function GridField({ className, fade = "radial" }: { className?: string; fade?: "radial" | "bottom" }) {
  const mask =
    fade === "radial"
      ? "radial-gradient(68% 58% at 50% 34%, #000 26%, transparent 100%)"
      : "linear-gradient(to bottom, #000 30%, transparent 100%)";
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 opacity-[0.42]", className)}
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(31,134,219,0.075) 1px, transparent 1px), linear-gradient(to bottom, rgba(31,134,219,0.075) 1px, transparent 1px)",
        backgroundSize: "84px 84px",
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}

/** Cursor-tracked spotlight wrapper for cards. */
export function Spotlight({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section" | "li";
}) {
  const onMove = useCallback((event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }, []);

  const Component = Tag as React.ElementType;
  return (
    <Component onMouseMove={onMove} className={cn("spotlight", className)}>
      {children}
    </Component>
  );
}

/** Thin luminous rule used to separate editorial sections. */
export function GlowRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("h-px w-full", className)}
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(31,134,219,0.35) 22%, rgba(249,115,22,0.4) 52%, rgba(31,134,219,0.28) 78%, transparent)",
      }}
    />
  );
}
