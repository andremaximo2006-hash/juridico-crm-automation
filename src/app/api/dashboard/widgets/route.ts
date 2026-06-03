import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const widgets = await prisma.dashboardWidget.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(widgets);
}

export async function PUT(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const widgets = await req.json() as Array<{
    widgetKey: string;
    label: string;
    isVisible: boolean;
    sortOrder: number;
    config: Record<string, unknown>;
  }>;

  await Promise.all(
    widgets.map((w) =>
      prisma.dashboardWidget.upsert({
        where: { widgetKey: w.widgetKey },
        update: {
          label: w.label,
          isVisible: w.isVisible,
          sortOrder: w.sortOrder,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          config: w.config as any,
        },
        create: {
          widgetKey: w.widgetKey,
          label: w.label,
          isVisible: w.isVisible,
          sortOrder: w.sortOrder,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          config: w.config as any,
        },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
