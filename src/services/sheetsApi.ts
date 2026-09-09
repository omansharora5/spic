/**
 * Google Sheets (Apps Script) live data for Team + Gallery.
 *
 * The sheet is the source of truth: edit rows there and the website
 * updates automatically (no redeploy needed). Sheet row order = display order.
 *
 * Priority: Google Sheet -> Firebase -> bundled static data.
 * If the sheet can't be reached, callers silently fall back.
 */

const DEFAULT_SHEETS_API_URL =
  "https://script.google.com/macros/s/AKfycbx2s-i80Rh2wCf8lHMhd-81Pj9KJrwQ-I1bK_LxCU4gP2rxk6kmXQPpcjphmpVdnd61jw/exec";

const SHEETS_API_URL = (
  (import.meta.env.VITE_SHEETS_API_URL as string | undefined) || DEFAULT_SHEETS_API_URL
).replace(/\/$/, "");

export const isSheetsEnabled = () => SHEETS_API_URL.length > 0;

interface SheetTeamRow {
  sno: number | string;
  name: string;
  post: string;
  department: string;
  level: string;
  image: string;
}

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

const levelToCategory = (level: string): string => {
  const l = (level || "").toLowerCase();
  if (l.includes("faculty")) return "faculty";
  if (l.includes("core")) return "core";
  if (l.includes("department") || l.includes("head")) return "department";
  return "member";
};

/** Team rows in sheet order (top row = first on site). */
export async function fetchSheetTeam() {
  const rows = await fetchSheet<SheetTeamRow>("team");
  return rows
    .filter((r) => r && r.name && String(r.name).trim())
    .map((r, i) => ({
      id: `sheet-${r.sno ?? i}`,
      name: String(r.name).trim(),
      role: String(r.post || "Member").trim(),
      department: String(r.department || "").trim() || undefined,
      image: String(r.image || "").trim() || undefined,
      category: levelToCategory(String(r.level || "")),
      order: Number(r.sno) || i,
    }));
}

/** Gallery images in sheet (serial number) order. */
export async function fetchSheetGallery(): Promise<SheetGalleryItem[]> {
  const rows = await fetchSheet<SheetGalleryItem>("gallery");
  return rows.filter((r) => r && r.image && String(r.image).trim());
}
