/**
 * Google Sheets (Apps Script) live data for Gallery.
 *
 * Team roster lives in src/data/team.ts and mirrors to Firebase —
 * the Sheet override raced the live snapshot and flashed stale rows.
 */

const DEFAULT_SHEETS_API_URL =
  "https://script.google.com/macros/s/AKfycbx2s-i80Rh2wCf8lHMhd-81Pj9KJrwQ-I1bK_LxCU4gP2rxk6kmXQPpcjphmpVdnd61jw/exec";

const SHEETS_API_URL = (
  (import.meta.env.VITE_SHEETS_API_URL as string | undefined) || DEFAULT_SHEETS_API_URL
).replace(/\/$/, "");

export const isSheetsEnabled = () => SHEETS_API_URL.length > 0;

export interface SheetGalleryItem {
  sno: number | string;
  caption: string;
  image: string;
}

async function fetchSheet<T>(sheet: "team" | "gallery"): Promise<T[]> {
  if (!isSheetsEnabled()) return [];
  const ctrl = new AbortController();
  // Generous timeout: Apps Script cold starts can take ~30s on first hit.
  const timer = setTimeout(() => ctrl.abort(), 45000);
  try {
    const res = await fetch(`${SHEETS_API_URL}?sheet=${sheet}&_=${Date.now()}`, {
      signal: ctrl.signal,
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data) ? (json.data as T[]) : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/** Gallery images in sheet (serial number) order. */
export async function fetchSheetGallery(): Promise<SheetGalleryItem[]> {
  const rows = await fetchSheet<SheetGalleryItem>("gallery");
  return rows.filter((r) => r && r.image && String(r.image).trim());
}
