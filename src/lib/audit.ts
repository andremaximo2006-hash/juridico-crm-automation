import { prisma } from "@/lib/prisma";
import { SessionPayload } from "@/lib/auth";

export async function auditLog(
  session: SessionPayload | null,
  action: "CREATE" | "UPDATE" | "DELETE",
  entity: string,
  entityId?: string,
  details?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId:   session?.userId ?? null,
        userName: session?.name   ?? null,
        action,
        entity,
        entityId: entityId ?? null,
        details:  details  ?? null,
      },
    });
  } catch {
    // audit nunca deve derrubar a operação principal
  }
}
