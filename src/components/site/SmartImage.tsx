import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import { assetUrl, placeholderTone } from "@/lib/media";
import { cn } from "@/utils/cn";

interface SmartImageProps {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  objectPosition?: string;
  priority?: boolean;
  rounded?: string;
  children?: React.ReactNode;
}

/**
 * Resilient image surface: resolves SPIC asset paths, lazy-loads by default and
 * degrades into a branded placeholder instead of a broken box.
 */
export default function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  objectPosition,
  priority = false,
  rounded = "rounded-lg",
  children,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  // ponytail: 2 delayed retries cover transient host blips; move images to a reliable CDN if failures persist.
  const [attempt, setAttempt] = useState(0);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );
  const resolved = assetUrl(src);
  const retrySrc = attempt && resolved ? `${resolved}${resolved.includes("?") ? "&" : "?"}spic-retry=${attempt}` : resolved;

  return (
    <div
      className={cn("relative overflow-hidden bg-ice", rounded, className)}
      style={{ backgroundImage: placeholderTone(alt || src || "spic") }}
    >
      {!failed && resolved ? (
        <motion.img
          src={retrySrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (attempt < 2) timer.current = window.setTimeout(() => setAttempt((a) => a + 1), 1200 * (attempt + 1));
            else setFailed(true);
          }}
          initial={false}
          animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 1.04 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={cn("h-full w-full object-cover", imgClassName)}
          style={{ objectPosition: objectPosition ?? "center" }}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-brand/45">
          <ImageIcon className="h-7 w-7" aria-hidden />
          <span className="px-6 text-center text-[11px] font-semibold tracking-[0.16em] text-brand/50 uppercase">
            {alt}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
