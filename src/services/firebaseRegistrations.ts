import QRCode from "qrcode";
import type { Registration, VerifyPayload, VerifyResult } from "./api";
import { sanitizeForFirestore } from "./firebaseEvents";
import { listDocs, getDoc, setDocData, subscribeDocs } from "./firestore";

const REGISTRATIONS_COLLECTION = "registrations";
const TEAM_REGISTRATIONS_COLLECTION = "team_registrations";

export interface TeamMemberRegistration {
  name: string;
  email: string;
  rollNumber: string;
  year: string;
  branch: string;
  phone: string;
  verificationToken: string;
  qrDataUrl: string;
  checkedIn: boolean;
  checkedInAt: string | null;
}

export interface TeamRegistration {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventVenue: string;
  teamName: string;
  leadEmail: string;
  members: TeamMemberRegistration[];
  pptLink: string;
  emailStatus: "pending" | "sent" | "failed";
  createdAt: string;
  isTeam: boolean;
}

/* ── utilities ────────────────────────────────────────────────── */

function uid(): string {
  const cryptoObj = globalThis.crypto as Crypto | undefined;
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function makeTicketQr(payload: Record<string, unknown>): Promise<string> {
  return QRCode.toDataURL(JSON.stringify(payload), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
    color: { dark: "#0B3B66", light: "#FFFFFF" },
  });
}

/* ── writes ───────────────────────────────────────────────────── */

export async function saveFirebaseRegistration(data: any): Promise<void> {
  if (!data.id) throw new Error("Registration ID is required");
  const cleanData = sanitizeForFirestore({
    ...data,
    checkedIn: data.checkedIn ?? false,
    checkedInAt: data.checkedInAt ?? null,
    createdAt: data.createdAt || new Date().toISOString(),
  });
  await setDocData(REGISTRATIONS_COLLECTION, data.id, cleanData);
}

export async function saveFirebaseTeamRegistration(data: any): Promise<void> {
  if (!data.id) throw new Error("Team registration ID is required");
  const cleanData = sanitizeForFirestore({
    ...data,
    isTeam: true,
    createdAt: data.createdAt || new Date().toISOString(),
  });
  await setDocData(TEAM_REGISTRATIONS_COLLECTION, data.id, cleanData);
}

/**
 * Direct Firestore registration path. Used when the REST API is unreachable
 * (cold start / offline) so participants are never blocked — the document
 * shape is identical to the API-produced one, including the QR ticket payload.
 */
export async function createRegistrationDirect(payload: {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventVenue: string;
  name: string;
  email: string;
  phone?: string;
  rollNumber: string;
  year: string;
  branch: string;
}): Promise<Registration> {
  const id = uid();
  const verificationToken = uid();
  const qrDataUrl = await makeTicketQr({
    registrationId: id,
    eventId: payload.eventId,
    verificationToken,
    isTeam: false,
  });

  const record = {
    id,
    eventId: payload.eventId,
    eventName: payload.eventName,
    eventDate: payload.eventDate,
    eventVenue: payload.eventVenue,
    participantName: payload.name,
    participantEmail: payload.email,
    phone: payload.phone || "",
    rollNumber: payload.rollNumber,
    year: payload.year,
    branch: payload.branch,
    verificationToken,
    qrDataUrl,
    emailStatus: "pending" as const,
    checkedIn: false,
    checkedInAt: null,
    createdAt: new Date().toISOString(),
  };

  await saveFirebaseRegistration(record);
  return record as unknown as Registration;
}

export async function createTeamRegistrationDirect(payload: {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventVenue: string;
  teamName: string;
  members: Array<{ name: string; email: string; rollNumber: string; year: string; branch: string; phone: string }>;
  pptLink: string;
}): Promise<{ id: string; teamName: string; qrDataUrl: string; message: string }> {
  const id = uid();
  const members: TeamMemberRegistration[] = [];

  for (let index = 0; index < payload.members.length; index += 1) {
    const member = payload.members[index];
    const verificationToken = uid();
    const qrDataUrl = await makeTicketQr({
      registrationId: id,
      eventId: payload.eventId,
      verificationToken,
      isTeam: true,
      memberIndex: index,
    });
    members.push({ ...member, verificationToken, qrDataUrl, checkedIn: false, checkedInAt: null });
  }

  const record = {
    id,
    eventId: payload.eventId,
    eventName: payload.eventName,
    eventDate: payload.eventDate,
    eventVenue: payload.eventVenue,
    teamName: payload.teamName,
    leadEmail: payload.members[0]?.email ?? "",
    members,
    pptLink: payload.pptLink,
    emailStatus: "pending" as const,
    createdAt: new Date().toISOString(),
    isTeam: true,
  };

  await saveFirebaseTeamRegistration(record);
  return {
    id,
    teamName: payload.teamName,
    qrDataUrl: members[0]?.qrDataUrl ?? "",
    message: "Team registered successfully. Show the QR ticket at the venue.",
  };
}

/* ── reads ────────────────────────────────────────────────────── */

export async function getFirebaseRegistrations(): Promise<{
  individual: any[];
  team: TeamRegistration[];
  all: any[];
}> {
  const [indDocs, teamDocs] = await Promise.all([
    listDocs(REGISTRATIONS_COLLECTION),
    listDocs(TEAM_REGISTRATIONS_COLLECTION),
  ]);

  const individual = indDocs.map((d) => ({ id: d.id, type: "individual", ...(d.data as any) }));
  const team = teamDocs.map((d) => ({ id: d.id, type: "team", ...(d.data as any) })) as TeamRegistration[];
  return { individual, team, all: [...individual, ...team] };
}

export function subscribeToFirebaseRegistrations(
  onData: (payload: { individual: any[]; team: TeamRegistration[]; all: any[] }) => void,
  onError?: (error: Error) => void,
): () => void {
  let individual: any[] = [];
  let team: TeamRegistration[] = [];

  const push = () => onData({ individual, team, all: [...individual, ...team] });

  const unsubA = subscribeDocs(
    REGISTRATIONS_COLLECTION,
    (docs) => {
      individual = docs.map((d) => ({ id: d.id, type: "individual", ...(d.data as any) }));
      push();
    },
    onError,
  );
  const unsubB = subscribeDocs(
    TEAM_REGISTRATIONS_COLLECTION,
    (docs) => {
      team = docs.map((d) => ({ id: d.id, type: "team", ...(d.data as any) })) as TeamRegistration[];
      push();
    },
    onError,
  );

  return () => {
    unsubA();
    unsubB();
  };
}

/* ── check-in / verification ──────────────────────────────────── */

export async function updateFirebaseCheckIn(
  registrationId: string,
  isTeam: boolean,
  memberIndex?: number,
): Promise<void> {
  const now = new Date().toISOString();
  if (!isTeam) {
    await setDocData(REGISTRATIONS_COLLECTION, registrationId, { checkedIn: true, checkedInAt: now });
    return;
  }

  const doc = await getDoc<any>(TEAM_REGISTRATIONS_COLLECTION, registrationId);
  if (!doc) throw new Error("Team registration not found");
  const members = Array.isArray(doc.data.members) ? [...doc.data.members] : [];
  if (typeof memberIndex === "number" && members[memberIndex]) {
    members[memberIndex] = { ...members[memberIndex], checkedIn: true, checkedInAt: now };
  } else {
    for (let i = 0; i < members.length; i += 1) members[i] = { ...members[i], checkedIn: true, checkedInAt: now };
  }
  await setDocData(TEAM_REGISTRATIONS_COLLECTION, registrationId, { members, checkedIn: true, checkedInAt: now });
}

/**
 * Firestore-backed ticket verification. Mirrors the API `/verify` contract and
 * is used as the resilient fallback path inside the scanner.
 */
export async function verifyTicketDirect(payload: VerifyPayload): Promise<VerifyResult> {
  const { registrationId, verificationToken, isTeam, memberIndex } = payload;

  if (isTeam) {
    const doc = await getDoc<any>(TEAM_REGISTRATIONS_COLLECTION, registrationId);
    if (!doc) return { valid: false, error: "Ticket not found for this event." };
    const members = (doc.data.members ?? []) as TeamMemberRegistration[];
    const member =
      typeof memberIndex === "number" ? members[memberIndex] : members.find((m) => m.verificationToken === verificationToken);
    if (!member || member.verificationToken !== verificationToken) {
      return { valid: false, error: "Invalid ticket credentials." };
    }
    const already = member.checkedIn;
    await updateFirebaseCheckIn(registrationId, true, memberIndex);
    return {
      valid: true,
      participantName: `${member.name} · ${doc.data.teamName ?? "Team"}`,
      participantEmail: member.email,
      eventName: doc.data.eventName,
      attendance: already ? "Already checked in" : "Attendance marked present",
    };
  }

  const doc = await getDoc<any>(REGISTRATIONS_COLLECTION, registrationId);
  if (!doc) return { valid: false, error: "Ticket not found for this event." };
  if (doc.data.verificationToken && doc.data.verificationToken !== verificationToken) {
    return { valid: false, error: "Invalid ticket credentials." };
  }
  const already = Boolean(doc.data.checkedIn);
  await updateFirebaseCheckIn(registrationId, false);
  return {
    valid: true,
    participantName: doc.data.participantName,
    participantEmail: doc.data.participantEmail,
    eventName: doc.data.eventName,
    attendance: already ? "Already checked in" : "Attendance marked present",
  };
}
