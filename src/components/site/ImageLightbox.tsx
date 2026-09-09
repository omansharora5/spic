import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { assetUrl } from "@/lib/media";

interface Props {
  images: string[];
  index: number | null;
  title?: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/** Accessible, keyboard-driven lightbox with soft enter/exit motion. */
export default function ImageLightbox({ images, index, title, onClose, onNavigate }: Props) {
  const open = index !== null && index >= 0 && index < images.length;

  const go = useCallback(
    (direction: 1 | -1) => {
      if (index === null) return;
      const next = (index + direction + images.length) % images.length;
      onNavigate(next);
    },
    [index, images.length, onNavigate],
  );

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", handler);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, go, onClose]);

  const current = open ? assetUrl(images[index as number]) : "";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title ? `${title} — image viewer` : "Image viewer"}
          className="fixed inset-0 z-[100] flex flex-col bg-[#061626]/92 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <div className="flex items-center justify-between gap-4 px-5 py-4 text-white/85 sm:px-8">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{title ?? "SPIC Gallery"}</p>
              <p className="text-xs text-white/55">
                {(index as number) + 1} / {images.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={current}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10 sm:flex"
                aria-label="Open original image"
              >
                <Download className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/85 transition hover:bg-white/10"
                aria-label="Close image viewer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-3 pb-6 sm:px-16">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                go(-1);
              }}
              className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white transition hover:bg-white/15 sm:left-6"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <AnimatePresence mode="wait">
              <motion.img
                key={current}
                src={current}
                alt={`${title ?? "SPIC"} photograph ${(index as number) + 1}`}
                onClick={(event) => event.stopPropagation()}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="max-h-[78vh] max-w-full rounded-lg object-contain shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
                draggable={false}
              />
            </AnimatePresence>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                go(1);
              }}
              className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white transition hover:bg-white/15 sm:right-6"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div
            className="hide-scrollbar flex gap-2 overflow-x-auto px-5 pb-5 sm:px-8"
            onClick={(event) => event.stopPropagation()}
          >
            {images.map((image, i) => (
              <button
                key={`${image}-${i}`}
                type="button"
                onClick={() => onNavigate(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={i === index}
                className={`h-14 w-20 shrink-0 overflow-hidden rounded-md border transition ${
                  i === index ? "border-sky opacity-100" : "border-white/10 opacity-50 hover:opacity-90"
                }`}
              >
                <img src={assetUrl(image)} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
