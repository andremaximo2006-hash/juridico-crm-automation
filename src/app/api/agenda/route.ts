import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listEvents, createEvent } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

async function getCalendarId(): Promise<string> {
  const row = await prisma.appSetting.findUnique({ where: { key: "google_calendar_id" } });
  return row?.value || "primary";
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year") ?? new Date().getFullYear());
  const month = Number(searchParams.get("month") ?? new Date().getMonth() + 1);

  const timeMin = new Date(year, month - 1, 1).toISOString();
  const timeMax = new Date(year, month, 1).toISOString();

  try {
    const calendarId = await getCalendarId();
    const events = await listEvents(timeMin, timeMax, calendarId);
    return NextResponse.json({ events });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const { title, description, location, date, startTime, endTime, allDay } = body;

  if (!title || !date) {
    return NextResponse.json({ error: "Título e data são obrigatórios" }, { status: 400 });
  }

  const TZ = "America/Sao_Paulo";

  const event = allDay
    ? {
        summary: title,
        description: description || undefined,
        location: location || undefined,
        start: { date },
        end: { date },
      }
    : {
        summary: title,
        description: description || undefined,
        location: location || undefined,
        start: { dateTime: `${date}T${startTime || "09:00"}:00`, timeZone: TZ },
        end:   { dateTime: `${date}T${endTime   || "10:00"}:00`, timeZone: TZ },
      };

  try {
    const calendarId = await getCalendarId();
    const created = await createEvent(event, calendarId);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao criar evento";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
