/**
 * SPIC REST API client — contract preserved from the production application.
 * Every endpoint, payload shape and header (including the admin PIN header)
 * matches the existing backend so no server change is required.
 */
const BASE =
  (import.meta.env.VITE_API_URL as string) ||
  (import.meta.env.DEV ? "https://spic-backend.onrender.com/api" : "https://spic-backend.onrender.com/api");

export interface RegistrationPayload {
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
  section: string;
}

export interface Registration {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventVenue: string;
  participantName: string;
  participantEmail: string;
  qrDataUrl: string;
  emailStatus: "pending" | "sent" | "failed";
  checkedIn: boolean;
  createdAt: string;
  verificationToken?: string;
}

export interface VerifyPayload {
  registrationId: string;
  eventId: string;
  verificationToken: string;
  isTeam?: boolean;
  memberIndex?: number;
}

export interface VerifyResult {
  valid: boolean;
  participantName?: string;
  participantEmail?: string;
  eventName?: string;
  attendance?: string;
  error?: string;
}

export interface TeamMember {
  name: string;
  email: string;
  rollNumber: string;
  year: string;
  branch: string;
  section: string;
  phone: string;
}

export interface TeamRegistrationPayload {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventVenue: string;
  teamName: string;
  members: TeamMember[];
  pptLink: string;
}

export interface TeamRegistrationResponse {
  id: string;
  teamName: string;
  qrDataUrl: string;
  message: string;
}

/** Requests fail fast so the UI can fall back to the direct Firestore path. */
async function request<T>(endpoint: string, options: RequestInit = {}, timeoutMs = 15000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      signal: controller.signal,
      ...options,
    });

    const contentType = res.headers.get("content-type");
    let data: any;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = { error: await res.text() };
    }

    if (!res.ok) {
      throw new Error(data.error || data.detail || `Request failed with status ${res.status}`);
    }
    return data as T;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  register(payload: RegistrationPayload) {
    return request<Registration>("/registrations", { method: "POST", body: JSON.stringify(payload) });
  },

  registerTeam(payload: TeamRegistrationPayload) {
    return request<TeamRegistrationResponse>("/registrations/team", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  registerPPT(formData: FormData) {
    return fetch(`${BASE}/upload/ppt`, { method: "POST", body: formData }).then(async (res) => {
      const contentType = res.headers.get("content-type");
      const data = contentType?.includes("application/json") ? await res.json() : { error: await res.text() };
      if (!res.ok) throw new Error(data.error || data.detail || `Upload failed with status ${res.status}`);
      return data as { url: string };
    });
  },

  uploadPPT(formData: FormData) {
    return this.registerPPT(formData);
  },

  getRegistrations(email: string) {
    return request<Registration[]>(`/registrations?email=${encodeURIComponent(email)}`);
  },

  verify(payload: VerifyPayload) {
    return request<VerifyResult>("/verify", { method: "POST", body: JSON.stringify(payload) });
  },

  contact(payload: { name: string; email: string; concern: string }) {
    return request<{ success: boolean; message: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /* ── Dynamic events ── */
  getEvents() {
    return request<import("@/data/events").Event[]>("/events");
  },
  getEvent(id: string) {
    return request<import("@/data/events").Event>(`/events/${id}`);
  },
  createEvent(payload: Partial<import("@/data/events").Event>, pin: string) {
    return request<import("@/data/events").Event>("/events", {
      method: "POST",
      headers: { "x-admin-pin": pin },
      body: JSON.stringify(payload),
    });
  },
  updateEvent(id: string, payload: Partial<import("@/data/events").Event>, pin: string) {
    return request<import("@/data/events").Event>(`/events/${id}`, {
      method: "PUT",
      headers: { "x-admin-pin": pin },
      body: JSON.stringify(payload),
    });
  },
  deleteEvent(id: string, pin: string) {
    return request<{ message: string }>(`/events/${id}`, {
      method: "DELETE",
      headers: { "x-admin-pin": pin },
    });
  },

  /* ── Admin portal ── */
  async verifyAdminPin(pin: string) {
    // 1) Same-origin server check (Vercel function; secret never leaves the server).
    try {
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (res.ok && data.success) return { success: true, message: "OK" };
      // Definitive wrong-PIN verdict -> stop here, don't try the legacy backend.
      if (res.status === 401) return { success: false, message: data.message || "Invalid PIN" };
      // 404/500 (function missing or secret not configured) -> try legacy backend below.
    } catch {
      // No same-origin API (e.g. `npm run dev`) -> try legacy backend below.
    }
    // 2) Legacy Render backend (existing behavior).
    return request<{ success: boolean; message: string }>("/admin/auth", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });
  },
  getAdminStats(pin: string) {
    return request<{
      totalEvents: number;
      totalRegistrations: number;
      totalParticipants: number;
      totalCheckedIn: number;
      eventStats: Record<string, { totalRegistrations: number; totalParticipants: number; checkedIn: number }>;
    }>("/admin/stats", { headers: { "x-admin-pin": pin } });
  },
  getAdminRegistrations(pin: string, eventId?: string) {
    const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : "";
    return request<any[]>(`/admin/registrations${query}`, { headers: { "x-admin-pin": pin } });
  },
  resendAdminTicket(payload: { registrationId: string; isTeam: boolean }, pin: string) {
    return request<{ success: boolean; message: string }>("/admin/resend-ticket", {
      method: "POST",
      headers: { "x-admin-pin": pin },
      body: JSON.stringify(payload),
    });
  },
};
