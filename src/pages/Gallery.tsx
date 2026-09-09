import { useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Camera, ChevronLeft, ChevronRight, Images } from "lucide-react";
import SmartImage from "@/components/site/SmartImage";
import ImageLightbox from "@/components/site/ImageLightbox";
import Reveal from "@/components/site/Reveal";
import { Grain, MeshBackdrop } from "@/components/site/Atmosphere";
import { Badge, buttonStyles, EmptyState, SectionHeading, Skeleton } from "@/components/ui/kit";
import type { GalleryAlbum } from "@/services/firebaseGallery";
import { formatEventDate, useGallery, useHorizontalRail, usePrefersReducedMotion } from "@/hooks/useSpicData";
import { cn } from "@/utils/cn";

interface LightboxState {
  images: string[];
  index: number | null;
  title?: string;
}

/** Horizontal, scroll-aware album rail with keyboard-reachable controls. */
function AlbumRail({ album, onOpen }: { album: GalleryAlbum; onOpen: (index: number) => void }) {
  const { ref, scrollBy } = useHorizontalRail<HTMLDivElement>();

  return (
    <div className="group/rail relative">
      <div className="shell flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">{album.category || "Album"}</Badge>
            <Badge tone="neutral">{album.images.length} photographs</Badge>
          </div>
          <h3 className="mt-3 font-display text-[clamp(1.5rem,3vw,2.2rem)] leading-tight font-semibold tracking-[-0.03em] text-ink">
            {album.title}
          </h3>
          {album.description ? <p className="mt-2 max-w-xl text-[14.5px] text-muted">{album.description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-1 hidden text-[12px] text-muted sm:inline">{formatEventDate(album.date)}</span>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label={`Scroll ${album.title} backwards`}
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-ink transition hover:border-brand hover:bg-ice"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label={`Scroll ${album.title} forwards`}
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-ink transition hover:border-brand hover:bg-ice"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="hide-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:px-8"
        tabIndex={0}
        role="group"
        aria-label={`${album.title} photographs`}
      >
        {album.images.map((image, index) => (
          <button
            key={`${album.id}-${index}`}
            type="button"
            onClick={() => onOpen(index)}
            className={cn(
              "group relative shrink-0 snap-start overflow-hidden rounded-[24px] bg-ice shadow-[var(--shadow-sm)] transition-all duration-350 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-lg)]",
              index % 5 === 0 ? "h-[19rem] w-[26rem] sm:h-[24rem] sm:w-[36rem]" : "h-[19rem] w-[16rem] sm:h-[24rem] sm:w-[20rem]",
            )}
            aria-label={`Open photograph ${index + 1} of ${album.title}`}
          >
            <SmartImage
              src={image}
              alt={`${album.title} photograph ${index + 1}`}
              rounded="rounded-[20px]"
              className="h-full w-full"
              imgClassName="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.05]"
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-[0.1em] text-deep uppercase">
                {album.category || album.title}
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ember text-white">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </span>
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04213a]/45 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Gallery() {
  const { albums, isLoading } = useGallery();
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<LightboxState>({ images: [], index: null });
  const reduced = usePrefersReducedMotion();

  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1, 1.12]);
  const heroY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "12%"]);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(albums.map((album) => album.category || album.title).filter(Boolean)))],
    [albums],
  );

  const visible = useMemo(
    () => (filter === "all" ? albums : albums.filter((album) => (album.category || album.title) === filter)),
    [albums, filter],
  );

  const featuredAlbum = visible[0];
  const mosaic = useMemo(() => visible.flatMap((album) => album.images.map((image) => ({ image, album }))).slice(0, 18), [visible]);
  const totalPhotos = albums.reduce((sum, album) => sum + album.images.length, 0);

  return (
    <>
      {/* Cinematic hero */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="relative h-[62vh] min-h-[26rem] w-full overflow-hidden">
          <motion.div style={{ scale: heroScale, y: heroY }} className="absolute inset-0">
            <SmartImage
              src={featuredAlbum?.coverImage || featuredAlbum?.images[0]}
              alt={featuredAlbum?.title ?? "SPIC gallery"}
              priority
              rounded="rounded-none"
              className="h-full w-full"
            />
          </motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,23,41,0.5)_0%,rgba(4,23,41,0.18)_36%,rgba(4,23,41,0.94)_100%)]" />
          <MeshBackdrop variant="deep" className="opacity-45 mix-blend-screen" />
          <Grain opacity={0.07} />
          <div className="vignette pointer-events-none absolute inset-0" />

          <div className="shell absolute inset-x-0 bottom-0 pb-11">
            <p className="text-[10.5px] font-bold tracking-[0.26em] text-sky uppercase">Gallery</p>
            <h1 className="mt-3.5 max-w-3xl text-[clamp(2.4rem,6.2vw,4.8rem)] leading-[0.93] font-semibold tracking-[-0.05em] text-white">
              The SPIC archive, <span className="serif-accent text-amber">frame by frame.</span>
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-[13px] text-white/80">
              <span className="inline-flex items-center gap-2">
                <Images className="h-4 w-4" /> {albums.length} albums
              </span>
              <span className="inline-flex items-center gap-2">
                <Camera className="h-4 w-4" /> {totalPhotos} photographs
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="sticky top-[4.6rem] z-30 border-b border-line bg-canvas/85 py-3 backdrop-blur-xl">
        <div className="shell hide-scrollbar flex gap-2 overflow-x-auto">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-all",
                filter === item
                  ? "border-deep bg-deep text-white"
                  : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {item === "all" ? "All albums" : item}
            </button>
          ))}
        </div>
      </section>

      {/* Albums */}
      <section className="py-14 lg:py-20">
        {isLoading ? (
          <div className="shell grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="shell">
            <EmptyState
              icon={<Images className="h-7 w-7" />}
              title="No albums published yet"
              description="Gallery albums appear here as soon as the team publishes them."
            />
          </div>
        ) : (
          <div className="space-y-20">
            {visible.map((album) => (
              <Reveal key={album.id} amount={0.05}>
                <AlbumRail
                  album={album}
                  onOpen={(index) => setLightbox({ images: album.images, index, title: album.title })}
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Irregular mosaic */}
      {mosaic.length ? (
        <section className="shell pb-24">
          <SectionHeading
            eyebrow="Mosaic"
            title="Moments, unsorted"
            description="A living wall of the campus building things together."
            action={
              <a href="#main" className={buttonStyles("ghost", "md", "rounded-full")}>
                Back to top <ArrowUpRight className="h-4 w-4" />
              </a>
            }
          />
          <div className="mt-10 columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
            {mosaic.map((entry, index) => (
              <button
                key={`${entry.album.id}-mosaic-${index}`}
                type="button"
                onClick={() =>
                  setLightbox({
                    images: entry.album.images,
                    index: entry.album.images.indexOf(entry.image),
                    title: entry.album.title,
                  })
                }
                className="group relative block w-full break-inside-avoid overflow-hidden rounded-[18px] border border-line transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
                aria-label={`Open ${entry.album.title} photograph ${index + 1}`}
              >
                <SmartImage
                  src={entry.image}
                  alt={`${entry.album.title} photograph`}
                  rounded="rounded-[18px]"
                  className={index % 5 === 0 ? "aspect-[3/4]" : index % 3 === 0 ? "aspect-square" : "aspect-[4/3]"}
                  imgClassName="transition-transform duration-700 group-hover:scale-[1.06]"
                />
                <span className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-deep opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {entry.album.title}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <ImageLightbox
        images={lightbox.images}
        index={lightbox.index}
        title={lightbox.title}
        onClose={() => setLightbox((state) => ({ ...state, index: null }))}
        onNavigate={(index) => setLightbox((state) => ({ ...state, index }))}
      />
    </>
  );
}
