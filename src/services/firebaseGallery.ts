import { listDocs, setDocData, deleteDocData, subscribeDocs } from "./firestore";

const GALLERY_COLLECTION = "gallery";

export interface GalleryAlbum {
  id: string;
  title: string;
  category?: string;
  description?: string;
  coverImage?: string;
  images: string[];
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

function toAlbum(id: string, data: Record<string, unknown>): GalleryAlbum {
  const images = Array.isArray(data.images) ? (data.images as string[]).filter(Boolean) : [];
  return {
    id: (data.id as string) || id,
    title: (data.title as string) || (data.category as string) || "Untitled album",
    category: (data.category as string) || "",
    description: (data.description as string) || "",
    coverImage: (data.coverImage as string) || images[0] || "",
    images,
    date: (data.date as string) || "",
    createdAt: (data.createdAt as string) || "",
    updatedAt: (data.updatedAt as string) || "",
  };
}

function sortAlbums(albums: GalleryAlbum[]): GalleryAlbum[] {
  return [...albums].sort((a, b) => {
    const ta = new Date(a.date || a.createdAt || 0).getTime() || 0;
    const tb = new Date(b.date || b.createdAt || 0).getTime() || 0;
    return tb - ta;
  });
}

export async function getGalleryAlbums(): Promise<GalleryAlbum[]> {
  const docs = await listDocs(GALLERY_COLLECTION);
  return sortAlbums(docs.map((doc) => toAlbum(doc.id, doc.data)));
}

export function subscribeToGallery(
  onData: (albums: GalleryAlbum[]) => void,
  onError?: (error: Error) => void,
): () => void {
  return subscribeDocs(
    GALLERY_COLLECTION,
    (docs) => onData(sortAlbums(docs.map((doc) => toAlbum(doc.id, doc.data)))),
    onError,
  );
}

export async function addGalleryItem(album: Partial<GalleryAlbum>): Promise<GalleryAlbum> {
  const id =
    album.id ||
    `gallery-${(album.title || "album")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}`;
  const now = new Date().toISOString();
  const payload = {
    id,
    title: album.title || "Untitled album",
    category: album.category || "",
    description: album.description || "",
    coverImage: album.coverImage || album.images?.[0] || "",
    images: album.images || [],
    date: album.date || now.slice(0, 10),
    createdAt: album.createdAt || now,
    updatedAt: now,
  };
  await setDocData(GALLERY_COLLECTION, id, payload);
  return toAlbum(id, payload);
}

export async function updateGalleryItem(id: string, patch: Partial<GalleryAlbum>): Promise<void> {
  await setDocData(GALLERY_COLLECTION, id, { ...patch, updatedAt: new Date().toISOString() });
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await deleteDocData(GALLERY_COLLECTION, id);
}
