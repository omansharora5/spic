/**
 * Firestore access layer (REST transport).
 *
 * Talks to the exact same Cloud Firestore project/collections the SPIC app has
 * always used (`events`, `gallery`, `team`, `registrations`, `teamRegistrations`).
 * Documents are read/written live — nothing here is mocked.
 */

const PROJECT_ID = (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || "aura-8cfbc";
const API_KEY =
  (import.meta.env.VITE_FIREBASE_API_KEY as string) || "AIzaSyATme5QeszOAyS456s6AINGDvZIfspEuY0";

const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

type FirestoreValue = Record<string, unknown>;

/* ── value codecs ─────────────────────────────────────────────── */

function decodeValue(value: FirestoreValue): unknown {
  if (value == null) return null;
  if ("nullValue" in value) return null;
  if ("stringValue" in value) return value.stringValue as string;
  if ("booleanValue" in value) return value.booleanValue as boolean;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("timestampValue" in value) return value.timestampValue as string;
  if ("arrayValue" in value) {
    const arr = (value.arrayValue as { values?: FirestoreValue[] })?.values ?? [];
    return arr.map(decodeValue);
  }
  if ("mapValue" in value) {
    const fields = (value.mapValue as { fields?: Record<string, FirestoreValue> })?.fields ?? {};
    return decodeFields(fields);
  }
  return null;
}

function decodeFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields || {})) out[key] = decodeValue(value);
  return out;
}

function encodeValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number")
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (typeof value === "object") return { mapValue: { fields: encodeFields(value as Record<string, unknown>) } };
  return { stringValue: String(value) };
}

export function encodeFields(data: Record<string, unknown>): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue; // mirrors ignoreUndefinedProperties
    fields[key] = encodeValue(value);
  }
  return fields;
}

export interface FirestoreDoc<T = Record<string, unknown>> {
  id: string;
  data: T;
  createTime?: string;
  updateTime?: string;
}

function docIdFromName(name: string): string {
  return name.split("/").pop() as string;
}

async function firestoreFetch(path: string, init?: RequestInit) {
  const joiner = path.includes("?") ? "&" : "?";
  const res = await fetch(`${ROOT}${path}${joiner}key=${API_KEY}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const text = await res.text();
  const payload = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message = payload?.error?.message || `Firestore request failed (${res.status})`;
    throw new Error(message);
  }
  return payload;
}

/* ── operations ───────────────────────────────────────────────── */

export async function listDocs<T = Record<string, unknown>>(
  collection: string,
  pageSize = 300,
): Promise<FirestoreDoc<T>[]> {
  const out: FirestoreDoc<T>[] = [];
  let pageToken: string | undefined;
  do {
    const query = `?pageSize=${pageSize}${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`;
    const payload = await firestoreFetch(`/${collection}${query}`);
    const docs = (payload.documents ?? []) as Array<{
      name: string;
      fields?: Record<string, FirestoreValue>;
      createTime?: string;
      updateTime?: string;
    }>;
    for (const doc of docs) {
      out.push({
        id: docIdFromName(doc.name),
        data: decodeFields(doc.fields ?? {}) as T,
        createTime: doc.createTime,
        updateTime: doc.updateTime,
      });
    }
    pageToken = payload.nextPageToken;
  } while (pageToken);
  return out;
}

export async function getDoc<T = Record<string, unknown>>(
  collection: string,
  id: string,
): Promise<FirestoreDoc<T> | null> {
  try {
    const doc = await firestoreFetch(`/${collection}/${encodeURIComponent(id)}`);
    return {
      id: docIdFromName(doc.name),
      data: decodeFields(doc.fields ?? {}) as T,
      createTime: doc.createTime,
      updateTime: doc.updateTime,
    };
  } catch (error) {
    if ((error as Error).message.toLowerCase().includes("not found")) return null;
    throw error;
  }
}

/** Create or fully replace a document with a known id (setDoc equivalent). */
export async function setDocData(
  collection: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  const mask = Object.keys(data)
    .filter((key) => data[key] !== undefined)
    .map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`)
    .join("&");
  await firestoreFetch(`/${collection}/${encodeURIComponent(id)}?${mask}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: encodeFields(data) }),
  });
}

/** Create a document with an auto-generated id (addDoc equivalent). */
export async function addDocData(
  collection: string,
  data: Record<string, unknown>,
): Promise<string> {
  const doc = await firestoreFetch(`/${collection}`, {
    method: "POST",
    body: JSON.stringify({ fields: encodeFields(data) }),
  });
  return docIdFromName(doc.name);
}

export async function deleteDocData(collection: string, id: string): Promise<void> {
  await firestoreFetch(`/${collection}/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/**
 * Live subscription. Firestore's realtime channel is not available over plain
 * REST, so this keeps the same callback contract via revalidating polls plus
 * refresh on tab focus — components stay reactive and unsubscribe cleanly.
 */
export function subscribeDocs<T = Record<string, unknown>>(
  collection: string,
  onData: (docs: FirestoreDoc<T>[]) => void,
  onError?: (error: Error) => void,
  intervalMs = 45000,
): () => void {
  let active = true;
  let timer: ReturnType<typeof setInterval> | undefined;

  const load = async () => {
    try {
      const docs = await listDocs<T>(collection);
      if (active) onData(docs);
    } catch (error) {
      if (active) onError?.(error as Error);
    }
  };

  void load();
  timer = setInterval(load, intervalMs);

  const onFocus = () => {
    if (document.visibilityState === "visible") void load();
  };
  document.addEventListener("visibilitychange", onFocus);

  return () => {
    active = false;
    if (timer) clearInterval(timer);
    document.removeEventListener("visibilitychange", onFocus);
  };
}
