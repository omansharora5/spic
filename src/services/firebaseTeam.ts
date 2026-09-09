import type { TeamMember } from "@/data/team";
import { listDocs, setDocData, deleteDocData, subscribeDocs } from "./firestore";

const TEAM_COLLECTION = "team";

export interface TeamMemberDoc extends TeamMember {
  category?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

function toMember(id: string, data: Record<string, unknown>): TeamMemberDoc {
  return { ...(data as unknown as TeamMemberDoc), id: (data.id as string) || id };
}

export async function getTeamMembers(): Promise<TeamMemberDoc[]> {
  const docs = await listDocs(TEAM_COLLECTION);
  return docs.map((doc) => toMember(doc.id, doc.data)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function subscribeToTeam(
  onData: (members: TeamMemberDoc[]) => void,
  onError?: (error: Error) => void,
): () => void {
  return subscribeDocs(
    TEAM_COLLECTION,
    (docs) =>
      onData(docs.map((doc) => toMember(doc.id, doc.data)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))),
    onError,
  );
}

export async function addTeamMember(member: Partial<TeamMemberDoc>): Promise<void> {
  const id = member.id || `tm-${Date.now()}`;
  const now = new Date().toISOString();
  await setDocData(TEAM_COLLECTION, id, { ...member, id, createdAt: member.createdAt || now, updatedAt: now });
}

export async function updateTeamMember(id: string, patch: Partial<TeamMemberDoc>): Promise<void> {
  await setDocData(TEAM_COLLECTION, id, { ...patch, updatedAt: new Date().toISOString() });
}

export async function deleteTeamMember(id: string): Promise<void> {
  await deleteDocData(TEAM_COLLECTION, id);
}
