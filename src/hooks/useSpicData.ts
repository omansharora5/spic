import { useEffect, useMemo, useRef, useState } from "react";
import type { Event } from "@/data/events";
import { coreLeadership, departmentHeads, facultyAdvisor, type TeamMember } from "@/data/team";
import {
  fallbackEvents,
  getFirebaseEvent,
  sortEventsList,
  subscribeToFirebaseEvents,
} from "@/services/firebaseEvents";
import { subscribeToGallery, type GalleryAlbum } from "@/services/firebaseGallery";
import { subscribeToTeam, type TeamMemberDoc } from "@/services/firebaseTeam";
import {
  fetchSheetGallery,
  fetchSheetTeam,
  isSheetsEnabled,
  type SheetGalleryItem,
} from "@/services/sheetsApi";

export type LoadState = "loading" | "live" | "fallback";

/** Live events from Firestore with the shipped dataset as graceful fallback. */
export function useEvents() {
  const [events, setEvents] = useState<Event[]>(() => sortEventsList(fallbackEvents));
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToFirebaseEvents(
      (list) => {
        if (list.length) setEvents(list);
        setState("live");
        setError(null);
      },
      (err) => {
        console.warn("[SPIC] Events stream unavailable, using bundled dataset:", err.message);
        setState("fallback");
        setError(err.message);
      },
    );
  }, []);

  return { events, state, error, isLoading: state === "loading" };
}

export function useEvent(eventId?: string) {
  const { events, state } = useEvents();
  const local = useMemo(() => events.find((e) => e.id === eventId) ?? null, [events, eventId]);
  const [event, setEvent] = useState<Event | null>(local);
  const [loading, setLoading] = useState(!local);

  useEffect(() => setEvent(local ?? null), [local]);

  useEffect(() => {
    let mounted = true;
    if (!eventId) {
      setLoading(false);
      return;
    }
    getFirebaseEvent(eventId)
      .then((fetched) => {
        if (mounted && fetched) setEvent(fetched);
      })
      .catch((err: Error) => {
        console.warn("[SPIC] Could not fetch event from Firestore, using fallback:", err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [eventId]);

  return { event, loading: loading && state === "loading", notFound: !loading && !event };
}

export function useGallery() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [sheetImages, setSheetImages] = useState<SheetGalleryItem[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToGallery(
      (list) => {
        setAlbums(list);
        setState("live");
        setError(null);
      },
      (err) => {
        console.warn("[SPIC] Gallery stream unavailable:", err.message);
        setState("fallback");
        setError(err.message);
      },
    );
  }, []);

  // Google Sheet gallery (serial order) -> its own album, shown first.
  useEffect(() => {
    if (!isSheetsEnabled()) return;
    let active = true;
    fetchSheetGallery().then((list) => {
      if (active && list.length > 0) setSheetImages(list);
    });
    return () => {
      active = false;
    };
  }, []);

  const displayAlbums = useMemo(() => {
    if (sheetImages.length === 0) return albums;
    const sheetAlbum: GalleryAlbum = {
      id: "sheet-gallery",
      title: "Event Gallery",
      category: "Events",
      description: "Managed live via Google Sheet.",
      coverImage: sheetImages[0].image,
      images: sheetImages.map((i) => i.image),
    };
    return [sheetAlbum, ...albums.filter((a) => a.id !== "sheet-gallery")];
  }, [albums, sheetImages]);

  return { albums: displayAlbums, state, error, isLoading: state === "loading" };
}

const bundledTeam: TeamMemberDoc[] = [
  { ...facultyAdvisor, category: "faculty" },
  ...coreLeadership.map((m: TeamMember) => ({ ...m, category: "core" })),
  ...departmentHeads.map((m: TeamMember) => ({ ...m, category: "department" })),
];

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMemberDoc[]>(bundledTeam);
  const [sheetMembers, setSheetMembers] = useState<TeamMemberDoc[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    return subscribeToTeam(
      (list) => {
        if (list.length) setMembers(list);
        setState("live");
      },
      (err) => {
        console.warn("[SPIC] Team stream unavailable, using bundled roster:", err.message);
        setState("fallback");
      },
    );
  }, []);

  // Google Sheet roster (sheet order = display order) overrides everything.
  useEffect(() => {
    if (!isSheetsEnabled()) return;
    let active = true;
    fetchSheetTeam().then((list) => {
      if (active && list.length > 0) setSheetMembers(list as TeamMemberDoc[]);
    });
    return () => {
      active = false;
    };
  }, []);

  return {
    members: sheetMembers.length > 0 ? sheetMembers : members,
    state,
    isLoading: state === "loading",
  };
}

/** Parses the loose date formats used across SPIC events. */
export function parseEventDate(value?: string): Date | null {
  if (!value) return null;
  const direct = new Date(value.includes("-") ? value.replace(/-/g, "/") : value);
  if (!isNaN(direct.getTime())) return direct;
  const match = value.match(/(\d{1,2})\s*([A-Za-z]+)\s*(\d{4})/);
  if (match) {
    const parsed = new Date(`${match[2]} ${match[1]}, ${match[3]}`);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

export function formatEventDate(value?: string): string {
  const date = parseEventDate(value);
  if (!date) return value ?? "Date to be announced";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function useCountdown(target?: string) {
  const date = useMemo(() => parseEventDate(target), [target]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!date) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [date]);

  if (!date) return null;
  const diff = Math.max(0, date.getTime() - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: diff === 0,
  };
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);
  return reduced;
}

/** Small helper for horizontal rails that need drag/scroll affordances. */
export function useHorizontalRail<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const scrollBy = (direction: 1 | -1) => {
    const node = ref.current;
    if (!node) return;
    node.scrollBy({ left: direction * Math.min(node.clientWidth * 0.8, 620), behavior: "smooth" });
  };
  return { ref, scrollBy };
}
