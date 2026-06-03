import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteEvent } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function getCalendarId(): Promise<string> {
  const row = await prisma.appSetting.findUnique({ where: { key: "google_calendar_id" } });
  return row?.value || "primary";
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  try {
    const calendarId = await getCalendarId();
    await deleteEvent(id, calendarId);
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao excluir evento";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
