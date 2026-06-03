import { prisma } from "@/lib/prisma";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.appSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

async function setSetting(key: string, value: string) {
  await prisma.appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

async function getAccessToken(): Promise<string> {
  const expiry = await getSetting("google_calendar_token_expiry");
  const now = Date.now();

  if (expiry && Number(expiry) > now + 60_000) {
    return (await getSetting("google_calendar_access_token")) ?? "";
  }

  // Refresh
  const clientId = await getSetting("google_client_id");
  const clientSecret = await getSetting("google_client_secret");
  const refreshToken = await getSetting("google_calendar_refresh_token");

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google Calendar não configurado");
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) throw new Error("Falha ao renovar token Google");

  const data = await res.json();
  await setSetting("google_calendar_access_token", data.access_token);
  await setSetting(
    "google_calendar_token_expiry",
    String(now + data.expires_in * 1000)
  );

  return data.access_token;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  htmlLink?: string;
  colorId?: string;
}

export async function listEvents(
  timeMin: string,
  timeMax: string,
  calendarId = "primary"
): Promise<CalendarEvent[]> {
  const token = await getAccessToken();

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });

  const res = await fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) throw new Error(`Google Calendar API: ${res.status}`);
  const data = await res.json();
  return data.items ?? [];
}

export async function createEvent(
  event: Omit<CalendarEvent, "id" | "htmlLink">,
  calendarId = "primary"
): Promise<CalendarEvent> {
  const token = await getAccessToken();

  const res = await fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro ao criar evento: ${err}`);
  }

  return res.json();
}

export async function deleteEvent(
  eventId: string,
  calendarId = "primary"
): Promise<void> {
  const token = await getAccessToken();
  await fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
  );
}
