import { coreLeadership, departmentHeads, facultyAdvisor, teamMembers, type TeamMember } from "@/data/team";
import { listDocs, setDocData, deleteDocData, subscribeDocs } from "./firestore";

const TEAM_COLLECTION = "team";

export interface TeamMemberDoc extends TeamMember {
  category?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

function toMember(id: string, data: Record<string, unknown>): TeamMemberDoc | null {
  const name = String((data.name as string) ?? "").trim();
  if (!name) return null; // one bad row must not blank/crash the whole page
  return {
    ...(data as unknown as TeamMemberDoc),
    id: (data.id as string) || id,
    name,
    role: String((data.role as string) ?? "").trim() || "Member",
  };
}

/** Full roster from the bundled file (the editable source of truth). */
export function buildFileRoster(): TeamMemberDoc[] {
  return [
    { ...facultyAdvisor, category: "faculty" },
    ...coreLeadership.map((m: TeamMember) => ({ ...m, category: "core" })),
    ...departmentHeads.map((m: TeamMember) => ({ ...m, category: "department" })),
    ...teamMembers.map((m: TeamMember) => ({ ...m, category: "member" })),
  ].map((m, i) => ({ ...m, order: i }));
}

/** One-click push of the bundled file roster to Firebase (upsert by stable id). */
export async function syncFileRosterToFirebase(): Promise<number> {
  const roster = buildFileRoster();
  const now = new Date().toISOString();
  for (const member of roster) {
    await setDocData(TEAM_COLLECTION, member.id, { ...member, updatedAt: now });
  }
  return roster.length;
}

function sortRoster(list: TeamMemberDoc[]): TeamMemberDoc[] {
  return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getTeamMembers(): Promise<TeamMemberDoc[]> {
  const docs = await listDocs(TEAM_COLLECTION);
  return sortRoster(
    docs.map((doc) => toMember(doc.id, doc.data)).filter((m): m is TeamMemberDoc => m !== null),
  );
}

export function subscribeToTeam(
  onData: (members: TeamMemberDoc[]) => void,
  onError?: (error: Error) => void,
): () => void {
  return subscribeDocs(
    TEAM_COLLECTION,
    (docs) =>
      onData(
        sortRoster(
          docs.map((doc) => toMember(doc.id, doc.data)).filter((m): m is TeamMemberDoc => m !== null),
        ),
      ),
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
