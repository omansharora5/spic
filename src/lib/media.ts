/**
 * Media resolution.
 *
 * The SPIC application stores image references as site-relative paths
 * (e.g. "/events/tedx-2025/DSC_1650.webp" or "/Aman.webp"). Those assets live in
 * the project's `public/` directory. This helper resolves them against the
 * configured asset origin so real photography keeps rendering wherever the
 * bundle is served from, while remote/absolute URLs pass through untouched.
 */
const ASSET_ORIGIN =
  (import.meta.env.VITE_ASSET_ORIGIN as string | undefined) ||
  "https://cdn.jsdelivr.net/gh/tnbcodesvishal/spic@main/public";

export function assetUrl(path?: string | null): string {
  if (!path) return "";
  const raw = String(path).trim();
  if (!raw) return "";
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:") || raw.startsWith("blob:")) return raw;

  const clean = raw.startsWith("/") ? raw : `/${raw}`;
  const encoded = clean
    .split("/")
    .map((segment) => (segment ? encodeURIComponent(decodeURIComponent(segment)) : segment))
    .join("/");
  return `${ASSET_ORIGIN}${encoded}`;
}

/** Deterministic tone for placeholder surfaces so layouts never collapse. */
export function placeholderTone(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  const tones = [
    "linear-gradient(135deg,#EAF7FF 0%,#D6ECFB 55%,#FFF1E8 100%)",
    "linear-gradient(140deg,#F5FBFF 0%,#DDF0FD 60%,#EAF7FF 100%)",
    "linear-gradient(125deg,#EAF7FF 0%,#FFE9D8 100%)",
    "linear-gradient(160deg,#E6F4FF 0%,#CDE8FA 70%,#FFF6EF 100%)",
  ];
  return tones[hash % tones.length];
}
