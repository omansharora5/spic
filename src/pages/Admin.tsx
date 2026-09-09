import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChartColumn,
  CircleCheck,
  Download,
  LoaderCircle,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Ticket,
  Trash,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Event } from "@/data/events";
import { MAX_EVENT_NOTES } from "@/data/events";
import { api } from "@/services/api";
import { deleteFirebaseEvent, saveFirebaseEvent } from "@/services/firebaseEvents";
import { subscribeToFirebaseRegistrations } from "@/services/firebaseRegistrations";
import { addGalleryItem, deleteGalleryItem } from "@/services/firebaseGallery";
import PinGate, { clearStoredPin, readStoredPin } from "@/components/admin/PinGate";
import EventNotes from "@/components/site/EventNotes";
import { useEvents, useGallery, formatEventDate } from "@/hooks/useSpicData";
import { Alert, Badge, Button, Field, Input, Select, Skeleton, Textarea, statusTone } from "@/components/ui/kit";
import { cn } from "@/utils/cn";

/* ─────────────────────── Event editor drawer ─────────────────────── */

const EMPTY_EVENT: Partial<Event> = {
  name: "",
  date: "",
  time: "",
  venue: "",
  status: "upcoming",
  category: "workshop",
  description: "",
  registrationType: "individual",
  minTeamSize: 1,
  maxTeamSize: 4,
  requirePpt: false,
  featured: false,
  whatsappGroupUrl: "",
  image: "",
};

function EventEditor({
  event,
  pin,
  onClose,
  onSaved,
}: {
  event: Partial<Event> | null;
  pin: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Partial<Event>>(event ?? EMPTY_EVENT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(event?.id);

  useEffect(() => setDraft(event ?? EMPTY_EVENT), [event]);

  const update = (patch: Partial<Event>) => setDraft((current) => ({ ...current, ...patch }));

  /* ── Participant instructions (max 5) ─────────────────────── */
  const notes = draft.notes ?? [];

  const setNote = (index: number, value: string) =>
    update({ notes: notes.map((note, i) => (i === index ? value : note)) });

  const addNote = () => {
    if (notes.length >= MAX_EVENT_NOTES) return;
    update({ notes: [...notes, ""] });
  };

  const removeNote = (index: number) => update({ notes: notes.filter((_, i) => i !== index) });

  const save = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    setError("");
    if (!draft.name?.trim()) {
      setError("Event name is required.");
      return;
    }
    setSaving(true);
    try {
      // Drop empty instruction rows so only meaningful points reach participants.
      const cleanNotes = (draft.notes ?? []).map((note) => note.trim()).filter(Boolean).slice(0, MAX_EVENT_NOTES);
      const payload: Partial<Event> = { ...draft, notes: cleanNotes };

      const saved = await saveFirebaseEvent(payload, pin);
      // Mirror to the REST API when it is reachable (keeps the backend in sync).
      const mirror = isEdit ? api.updateEvent(saved.id, payload, pin) : api.createEvent(payload, pin);
      mirror.catch((err: Error) => console.warn("[Admin] API event mirror note:", err.message));
      toast.success(isEdit ? "Event updated" : "Event created", { description: saved.name });
      onSaved();
      onClose();
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      toast.error("Could not save event", { description: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      <div className="absolute inset-0 bg-deep/35 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={save}
        className="relative flex h-full w-full max-w-2xl flex-col overflow-y-auto border-l border-line bg-surface"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit event" : "Create event"}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-surface/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-muted uppercase">Event management</p>
            <h2 className="font-display text-[20px] font-semibold text-ink">{isEdit ? "Edit event" : "Create event"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:bg-mist">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 px-6 py-6">
          {error ? <Alert tone="error">{error}</Alert> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Event name" required className="sm:col-span-2">
              <Input value={draft.name ?? ""} onChange={(e) => update({ name: e.target.value })} placeholder="Ideation '26" />
            </Field>
            <Field label="Date" required hint="ISO or readable">
              <Input value={draft.date ?? ""} onChange={(e) => update({ date: e.target.value })} placeholder="2026-10-06" />
            </Field>
            <Field label="Time">
              <Input value={draft.time ?? ""} onChange={(e) => update({ time: e.target.value })} placeholder="10:00 AM onwards" />
            </Field>
            <Field label="Venue" className="sm:col-span-2">
              <Input value={draft.venue ?? ""} onChange={(e) => update({ venue: e.target.value })} placeholder="Seminar Hall, D Block" />
            </Field>
            <Field label="Status">
              <Select value={draft.status ?? "upcoming"} onChange={(e) => update({ status: e.target.value as Event["status"] })}>
                {["upcoming", "open", "closed", "ended"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Category">
              <Select value={draft.category ?? "workshop"} onChange={(e) => update({ category: e.target.value as Event["category"] })}>
                {["hackathon", "workshop", "talk", "competition", "visit", "seminar"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea value={draft.description ?? ""} onChange={(e) => update({ description: e.target.value })} rows={4} />
            </Field>

            <Field label="Registration type">
              <Select
                value={draft.registrationType ?? "individual"}
                onChange={(e) => update({ registrationType: e.target.value as Event["registrationType"] })}
              >
                <option value="individual">Individual</option>
                <option value="team">Team</option>
              </Select>
            </Field>
            <Field label="Cover image path / URL">
              <Input value={draft.image ?? ""} onChange={(e) => update({ image: e.target.value })} placeholder="/events/…/cover.webp" />
            </Field>
            <Field label="Min team size">
              <Input type="number" min={1} value={draft.minTeamSize ?? 1} onChange={(e) => update({ minTeamSize: Number(e.target.value) })} />
            </Field>
            <Field label="Max team size">
              <Input type="number" min={1} value={draft.maxTeamSize ?? 4} onChange={(e) => update({ maxTeamSize: Number(e.target.value) })} />
            </Field>
            <Field label="WhatsApp group URL" className="sm:col-span-2">
              <Input value={draft.whatsappGroupUrl ?? ""} onChange={(e) => update({ whatsappGroupUrl: e.target.value })} placeholder="https://chat.whatsapp.com/…" />
            </Field>
          </div>

          <div className="flex flex-wrap gap-5 rounded-[16px] border border-line bg-mist p-4">
            <label className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
              <input type="checkbox" checked={Boolean(draft.requirePpt)} onChange={(e) => update({ requirePpt: e.target.checked })} className="h-4 w-4 accent-[#2388d9]" />
              Require pitch deck upload
            </label>
            <label className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
              <input type="checkbox" checked={Boolean(draft.featured)} onChange={(e) => update({ featured: e.target.checked })} className="h-4 w-4 accent-[#f97316]" />
              Feature on homepage
            </label>
          </div>

          {/* ── Participant instructions shown on the public event pages ── */}
          <div className="rounded-[18px] border border-brand/22 bg-[linear-gradient(140deg,#F4FAFE_0%,#FFFFFF_60%,#FFF6F0_100%)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[14px] font-bold text-deep">Participant instructions</h3>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                  Important points participants must know — carry your laptop, reporting time, dress code,
                  anything critical. Shown on the event and registration pages.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-brand ring-1 ring-brand/15 ring-inset">
                {notes.length}/{MAX_EVENT_NOTES}
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {notes.map((note, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#1f86db,#7fd0fb)] text-[12px] font-bold text-white">
                    {index + 1}
                  </span>
                  <Input
                    value={note}
                    onChange={(e) => setNote(index, e.target.value)}
                    placeholder="e.g. Bring your laptop & charger"
                    aria-label={`Instruction ${index + 1}`}
                    className="bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeNote(index)}
                    aria-label={`Remove instruction ${index + 1}`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-white text-[#B42318] transition hover:bg-[#FEF3F2]"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addNote}
              disabled={notes.length >= MAX_EVENT_NOTES}
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-deep px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#0e4c82] disabled:opacity-45"
            >
              <Plus className="h-3.5 w-3.5" /> Add instruction
            </button>

            {notes.length >= MAX_EVENT_NOTES ? (
              <p className="mt-2 text-[11.5px] text-faint">Maximum of {MAX_EVENT_NOTES} instructions reached.</p>
            ) : null}

            {notes.some((note) => note.trim()) ? (
              <div className="mt-5 border-t border-brand/15 pt-5">
                <p className="mb-3 text-[10.5px] font-bold tracking-[0.18em] text-faint uppercase">Live preview</p>
                <EventNotes notes={notes} compact />
              </div>
            ) : null}
          </div>
        </div>

        <footer className="sticky bottom-0 mt-auto flex gap-3 border-t border-line bg-surface/95 px-6 py-4 backdrop-blur">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CircleCheck className="h-4 w-4" />}
            {isEdit ? "Save changes" : "Create event"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </footer>
      </form>
    </div>
  );
}

/* ────────────────────────── Dashboard ────────────────────────── */

type RegistrationRow = {
  id: string;
  type: "individual" | "team";
  eventId?: string;
  eventName?: string;
  participantName?: string;
  participantEmail?: string;
  teamName?: string;
  members?: Array<{ name: string; email: string; checkedIn?: boolean }>;
  checkedIn?: boolean;
  createdAt?: string;
  rollNumber?: string;
  branch?: string;
  year?: string;
};

function StatTile({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: string | number; sub?: string }) {
  return (
    <div className="spotlight rounded-[20px] border border-line bg-surface p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <div className="flex items-center justify-between">
        <p className="text-[11.5px] font-bold tracking-[0.16em] text-muted uppercase">{label}</p>
        <Icon className="h-4 w-4 text-brand" />
      </div>
      <p className="relative z-10 mt-3 font-display text-[2rem] leading-none font-semibold tracking-[-0.05em] text-deep tabular">{value}</p>
      {sub ? <p className="mt-1.5 text-[12.5px] text-muted">{sub}</p> : null}
    </div>
  );
}

export default function Admin() {
  const [pin, setPin] = useState<string | null>(() => readStoredPin());
  const { events, isLoading: eventsLoading } = useEvents();
  const { albums } = useGallery();

  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [regLoading, setRegLoading] = useState(true);
  const [regError, setRegError] = useState("");
  const [editor, setEditor] = useState<{ open: boolean; event: Partial<Event> | null }>({ open: false, event: null });
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [refreshToken, setRefreshToken] = useState(0);
  const [newAlbum, setNewAlbum] = useState({ title: "", category: "", description: "", images: "" });
  const [albumBusy, setAlbumBusy] = useState(false);

  useEffect(() => {
    if (!pin) return;
    setRegLoading(true);
    return subscribeToFirebaseRegistrations(
      (payload) => {
        setRegistrations(payload.all as RegistrationRow[]);
        setRegLoading(false);
        setRegError("");
      },
      (err) => {
        setRegError(err.message);
        setRegLoading(false);
      },
    );
  }, [pin, refreshToken]);

  const stats = useMemo(() => {
    const participants = registrations.reduce(
      (sum, row) => sum + (row.type === "team" ? (row.members?.length ?? 0) : 1),
      0,
    );
    const checkedIn = registrations.reduce((sum, row) => {
      if (row.type === "team") return sum + (row.members?.filter((m) => m.checkedIn).length ?? 0);
      return sum + (row.checkedIn ? 1 : 0);
    }, 0);
    return { events: events.length, registrations: registrations.length, participants, checkedIn };
  }, [events, registrations]);

  const filteredRegistrations = useMemo(() => {
    const term = query.trim().toLowerCase();
    return registrations
      .filter((row) => eventFilter === "all" || row.eventId === eventFilter)
      .filter((row) => {
        if (!term) return true;
        const haystack = [
          row.participantName,
          row.participantEmail,
          row.teamName,
          row.eventName,
          row.rollNumber,
          ...(row.members?.map((m) => `${m.name} ${m.email}`) ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      })
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  }, [registrations, query, eventFilter]);

  if (!pin) {
    return (
      <PinGate
        title="Admin console"
        description="Enter the operations PIN to manage events, registrations and gallery albums."
        onAuthenticated={setPin}
      />
    );
  }

  const removeEvent = async (event: Event) => {
    if (!window.confirm(`Delete "${event.name}"? This cannot be undone.`)) return;
    try {
      await deleteFirebaseEvent(event.id, pin);
      api.deleteEvent(event.id, pin).catch((err: Error) => console.warn("[Admin] API delete mirror note:", err.message));
      toast.success("Event deleted", { description: event.name });
      setRefreshToken((token) => token + 1);
    } catch (err) {
      toast.error("Could not delete event", { description: (err as Error).message });
    }
  };

  const resendTicket = async (row: RegistrationRow) => {
    try {
      const res = await api.resendAdminTicket({ registrationId: row.id, isTeam: row.type === "team" }, pin);
      toast.success(res.message || "Ticket resent");
    } catch (err) {
      toast.error("Resend unavailable", { description: (err as Error).message });
    }
  };

  const exportCsv = () => {
    const header = ["Type", "Event", "Name / Team", "Email", "Roll", "Branch", "Year", "Checked in", "Created"];
    const rows = filteredRegistrations.map((row) => [
      row.type,
      row.eventName ?? "",
      row.type === "team" ? (row.teamName ?? "") : (row.participantName ?? ""),
      row.participantEmail ?? row.members?.[0]?.email ?? "",
      row.rollNumber ?? "",
      row.branch ?? "",
      row.year ?? "",
      row.type === "team" ? `${row.members?.filter((m) => m.checkedIn).length ?? 0}/${row.members?.length ?? 0}` : row.checkedIn ? "yes" : "no",
      row.createdAt ?? "",
    ]);
    const csv = [header, ...rows].map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `spic-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const createAlbum = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    if (!newAlbum.title.trim()) return;
    setAlbumBusy(true);
    try {
      await addGalleryItem({
        title: newAlbum.title.trim(),
        category: newAlbum.category.trim() || newAlbum.title.trim(),
        description: newAlbum.description.trim(),
        images: newAlbum.images
          .split(/[\n,]/)
          .map((value) => value.trim())
          .filter(Boolean),
      });
      toast.success("Album published", { description: newAlbum.title });
      setNewAlbum({ title: "", category: "", description: "", images: "" });
    } catch (err) {
      toast.error("Could not publish album", { description: (err as Error).message });
    } finally {
      setAlbumBusy(false);
    }
  };

  return (
    <div className="shell py-8 lg:py-12">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="eyebrow"><span className="inline-block h-px w-6 bg-brand/45" aria-hidden />Operations</p>
          <h1 className="mt-2 font-display text-[clamp(1.9rem,4vw,2.6rem)] leading-tight font-semibold tracking-[-0.035em] text-ink">
            Admin dashboard
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setRefreshToken((token) => token + 1)}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearStoredPin();
              setPin(null);
            }}
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </header>

      {/* Overview */}
      <section className="mt-6" aria-label="Overview">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile icon={CalendarDays} label="Events" value={stats.events} sub="Published in Firestore" />
          <StatTile icon={Ticket} label="Registrations" value={stats.registrations} sub="Individual + team entries" />
          <StatTile icon={Users} label="Participants" value={stats.participants} sub="Total people registered" />
          <StatTile icon={ChartColumn} label="Checked in" value={stats.checkedIn} sub="Scanned at venue" />
        </div>
      </section>

      {/* Event management */}
      <section className="mt-8 overflow-hidden rounded-[26px] border border-line bg-surface shadow-[var(--shadow-sm)]" aria-label="Event management">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5">
          <div>
            <h2 className="font-display text-[19px] font-semibold text-ink">Event management</h2>
            <p className="mt-0.5 text-[13px] text-muted">Create, edit and remove events across the SPIC calendar.</p>
          </div>
          <Button onClick={() => setEditor({ open: true, event: null })}>
            <Plus className="h-4 w-4" /> Create event
          </Button>
        </div>

        <div className="overflow-x-auto">
          {eventsLoading && !events.length ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12" />
              ))}
            </div>
          ) : (
            <table className="w-full min-w-[46rem] text-left text-[13.5px]">
              <thead className="bg-mist text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
                <tr>
                  <th className="px-6 py-3">Event</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Registrations</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {events.map((event) => {
                  const count = registrations.filter((row) => row.eventId === event.id).length;
                  return (
                    <tr key={event.id} className="transition hover:bg-mist/60">
                      <td className="px-6 py-3.5">
                        <p className="font-semibold text-ink">{event.name}</p>
                        <p className="text-[12px] text-muted">{event.venue}</p>
                      </td>
                      <td className="px-4 py-3.5 text-muted">{formatEventDate(event.date)}</td>
                      <td className="px-4 py-3.5">
                        <Badge tone={statusTone(event.status)}>{event.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-muted capitalize">{event.registrationType ?? "individual"}</td>
                      <td className="px-4 py-3.5 font-semibold text-ink tabular-nums">{count}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditor({ open: true, event })}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#B42318] hover:bg-[#FEF2F2]"
                            onClick={() => void removeEvent(event)}
                          >
                            <Trash className="h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Registrations */}
      <section className="mt-8 overflow-hidden rounded-[26px] border border-line bg-surface shadow-[var(--shadow-sm)]" aria-label="Registrations">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5">
          <div>
            <h2 className="font-display text-[19px] font-semibold text-ink">Registrations</h2>
            <p className="mt-0.5 text-[13px] text-muted">Live participant records from Firestore.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, email, team"
                aria-label="Search registrations"
                className="h-10 w-56 pl-9"
              />
            </div>
            <Select
              value={eventFilter}
              onChange={(event) => setEventFilter(event.target.value)}
              aria-label="Filter by event"
              className="h-10 w-48"
            >
              <option value="all">All events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </Select>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={!filteredRegistrations.length}>
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
          </div>
        </div>

        {regError ? (
          <div className="p-6">
            <Alert tone="error" title="Could not load registrations">
              {regError}
            </Alert>
          </div>
        ) : regLoading ? (
          <div className="space-y-2 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <p className="px-6 py-12 text-center text-[14px] text-muted">No registrations match the current filters.</p>
        ) : (
          <div className="max-h-[34rem] overflow-auto">
            <table className="w-full min-w-[52rem] text-left text-[13.5px]">
              <thead className="sticky top-0 z-10 bg-mist text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
                <tr>
                  <th className="px-6 py-3">Participant / Team</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Check-in</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredRegistrations.map((row) => {
                  const checked =
                    row.type === "team"
                      ? `${row.members?.filter((m) => m.checkedIn).length ?? 0}/${row.members?.length ?? 0}`
                      : row.checkedIn
                        ? "Present"
                        : "Pending";
                  return (
                    <tr key={row.id} className="transition hover:bg-mist/60">
                      <td className="px-6 py-3.5">
                        <p className="font-semibold text-ink">
                          {row.type === "team" ? row.teamName : row.participantName}
                        </p>
                        <p className="text-[12px] text-muted">
                          {row.type === "team" ? `${row.members?.length ?? 0} members` : (row.rollNumber ?? "—")}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-muted">{row.eventName ?? "—"}</td>
                      <td className="px-4 py-3.5 text-muted">
                        {row.participantEmail ?? row.members?.[0]?.email ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
                            row.checkedIn || (row.type === "team" && row.members?.some((m) => m.checkedIn))
                              ? "bg-[#E9F9F0] text-[#0F7A46]"
                              : "bg-mist text-muted",
                          )}
                        >
                          {checked}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Button variant="ghost" size="sm" onClick={() => void resendTicket(row)}>
                          <RefreshCw className="h-3.5 w-3.5" /> Resend ticket
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Gallery management */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]" aria-label="Gallery management">
        <form onSubmit={createAlbum} className="rounded-[24px] border border-line bg-surface p-6">
          <h2 className="font-display text-[19px] font-semibold text-ink">Publish gallery album</h2>
          <p className="mt-0.5 text-[13px] text-muted">Albums appear instantly on the public gallery.</p>

          <div className="mt-5 space-y-4">
            <Field label="Album title" required>
              <Input value={newAlbum.title} onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })} placeholder="TEDx RKGIT" />
            </Field>
            <Field label="Category">
              <Input value={newAlbum.category} onChange={(e) => setNewAlbum({ ...newAlbum, category: e.target.value })} placeholder="TEDx RKGIT" />
            </Field>
            <Field label="Description">
              <Textarea value={newAlbum.description} onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })} rows={3} />
            </Field>
            <Field label="Image paths / URLs" hint="One per line">
              <Textarea
                value={newAlbum.images}
                onChange={(e) => setNewAlbum({ ...newAlbum, images: e.target.value })}
                rows={4}
                placeholder={"/events/tedx-2025/DSC_1650.webp\nhttps://…"}
              />
            </Field>
            <Button type="submit" disabled={albumBusy || !newAlbum.title.trim()} className="w-full">
              {albumBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Publish album
            </Button>
          </div>
        </form>

        <div className="rounded-[24px] border border-line bg-surface p-6">
          <h2 className="font-display text-[19px] font-semibold text-ink">Published albums</h2>
          <ul className="mt-4 divide-y divide-line">
            {albums.length === 0 ? (
              <li className="py-8 text-center text-[13.5px] text-muted">No albums published yet.</li>
            ) : (
              albums.map((album) => (
                <li key={album.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{album.title}</p>
                    <p className="text-[12px] text-muted">
                      {album.images.length} photographs · {album.category || "Uncategorised"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#B42318] hover:bg-[#FEF2F2]"
                    onClick={async () => {
                      if (!window.confirm(`Delete album "${album.title}"?`)) return;
                      try {
                        await deleteGalleryItem(album.id);
                        toast.success("Album deleted");
                      } catch (err) {
                        toast.error("Could not delete album", { description: (err as Error).message });
                      }
                    }}
                  >
                    <Trash className="h-3.5 w-3.5" /> Delete
                  </Button>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      {editor.open ? (
        <EventEditor
          event={editor.event}
          pin={pin}
          onClose={() => setEditor({ open: false, event: null })}
          onSaved={() => setRefreshToken((token) => token + 1)}
        />
      ) : null}
    </div>
  );
}
