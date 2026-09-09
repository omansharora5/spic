import type { Event } from "@/data/events";
import { upcomingEvents, pastEvents } from "@/data/events";
import { listDocs, getDoc, setDocData, deleteDocData, subscribeDocs } from "./firestore";

const EVENTS_COLLECTION = "events";
// Client-side PIN for Firestore-write guards. Set via Vercel env var
// VITE_ADMIN_PIN (same value as the server ADMIN_PIN). NEVER hardcode
// a real PIN here — this file ships to browsers and lives in git history.
export const ADMIN_PIN = (import.meta.env.VITE_ADMIN_PIN as string | undefined) || "";

/* ── helpers (ported from the production service) ─────────────── */

export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.filter((item) => item !== undefined).map((item) => sanitizeForFirestore(item));
  if (typeof obj === "object") {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) cleaned[key] = sanitizeForFirestore(value);
    }
    return cleaned;
  }
  return obj;
}

export function getEventTimestamp(ev: Event): number {
  if (ev.createdAt) {
    const t = new Date(ev.createdAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (ev.updatedAt) {
    const t = new Date(ev.updatedAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (ev.date) {
    const cleanStr = ev.date.includes("-") ? ev.date.replace(/-/g, "/") : ev.date;
    const t = new Date(cleanStr).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  return 0;
}

export function sortEventsList(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    const order: Record<string, number> = { open: 1, upcoming: 2, closed: 3, ended: 4 };
    const orderA = order[a.status] || 5;
    const orderB = order[b.status] || 5;
    if (orderA !== orderB) return orderA - orderB;
    const timeA = getEventTimestamp(a);
    const timeB = getEventTimestamp(b);
    if (timeA !== timeB) return timeB - timeA;
    return 0;
  });
}

export const fallbackEvents: Event[] = [...upcomingEvents, ...pastEvents];

function toEvent(id: string, data: Record<string, unknown>): Event {
  return { ...(data as unknown as Event), id: (data.id as string) || id };
}

/* ── reads ────────────────────────────────────────────────────── */

export async function getFirebaseEvents(): Promise<Event[]> {
  const docs = await listDocs(EVENTS_COLLECTION);
  const events = docs.map((doc) => toEvent(doc.id, doc.data));
  return sortEventsList(events);
}

export async function getFirebaseEvent(id: string): Promise<Event | null> {
  const doc = await getDoc(EVENTS_COLLECTION, id);
  if (!doc) return null;
  return toEvent(doc.id, doc.data);
}

export function subscribeToFirebaseEvents(
  onData: (events: Event[]) => void,
  onError?: (error: Error) => void,
): () => void {
  return subscribeDocs(
    EVENTS_COLLECTION,
    (docs) => onData(sortEventsList(docs.map((doc) => toEvent(doc.id, doc.data)))),
    onError,
  );
}

/* ── writes (admin) ───────────────────────────────────────────── */

function assertPin(pin: string) {
  if (pin?.trim() !== ADMIN_PIN) throw new Error("Unauthorized: invalid admin PIN");
}

export async function saveFirebaseEvent(eventData: Partial<Event>, pin: string): Promise<Event> {
  assertPin(pin);
  const id =
    eventData.id ||
    (eventData.name || "event")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const existing = await getDoc(EVENTS_COLLECTION, id);
  const now = new Date().toISOString();
  const payload = sanitizeForFirestore({
    ...(existing?.data ?? {}),
    ...eventData,
    id,
    createdAt: (existing?.data as any)?.createdAt || eventData.createdAt || now,
    updatedAt: now,
  }) as Record<string, unknown>;

  await setDocData(EVENTS_COLLECTION, id, payload);
  return toEvent(id, payload);
}

export async function deleteFirebaseEvent(id: string, pin: string): Promise<void> {
  assertPin(pin);
  await deleteDocData(EVENTS_COLLECTION, id);
}
