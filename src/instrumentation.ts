export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { prisma } = await import("@/lib/prisma");

  async function getSettings(): Promise<Record<string, string>> {
    const rows = await prisma.appSetting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  async function checkAsaasOverdue() {
    try {
      const settings = await getSettings();
      const apiKey = settings["asaas_api_key"];
      const webhookUrl = settings["discord_webhook_financeiro"];

      if (!apiKey || !webhookUrl) {
        console.log("[Asaas] API key ou webhook não configurados — pulando");
        return;
      }

      const env = settings["asaas_environment"] ?? "production";
      const baseUrl =
        env === "sandbox"
          ? "https://sandbox.asaas.com/api/v3"
          : "https://api.asaas.com/api/v3";

      const res = await fetch(`${baseUrl}/payments?status=OVERDUE&limit=100`, {
        headers: { access_token: apiKey },
      });

      if (!res.ok) {
        console.error("[Asaas] Erro ao buscar cobranças:", res.status);
        return;
      }

      const data = await res.json();
      const overdue: { value: number; customer: string; dueDate: string }[] =
        data.data ?? [];
      const count = data.totalCount ?? overdue.length;

      console.log(`[Asaas] ${count} cobrança(s) vencida(s) encontrada(s)`);

      if (count === 0) return;

      const totalValue = overdue
        .slice(0, 10)
        .reduce((s: number, p: { value: number }) => s + (p.value ?? 0), 0);

      const lines = overdue.slice(0, 5).map(
        (p: { value: number; customer: string; dueDate: string }) =>
          `• R$ ${Number(p.value).toFixed(2).replace(".", ",")} — venc. ${p.dueDate}`
      );

      const message =
        `🔴 **${count} cobrança(s) vencida(s) no Asaas**\n` +
        (lines.length > 0 ? lines.join("\n") + "\n" : "") +
        (count > 5 ? `_...e mais ${count - 5} cobranças_\n` : "") +
        `\n💰 Total (amostra): R$ ${totalValue.toFixed(2).replace(".", ",")}`;

      const discordRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });

      if (discordRes.ok) {
        console.log("[Asaas] Notificação Discord enviada — " + count + " cobranças vencidas");
      } else {
        console.error("[Asaas] Erro ao enviar Discord:", discordRes.status);
      }
    } catch (err) {
      console.error("[Asaas] Erro no scheduler:", err);
    }
  }

  // Agenda execução diária às 08h BRT (11h UTC)
  function scheduleNext() {
    const now = new Date();
    const next = new Date(now);
    next.setUTCHours(11, 0, 0, 0);
    if (next <= now) next.setUTCDate(next.getUTCDate() + 1);

    const delay = next.getTime() - now.getTime();
    console.log(
      `[CRM Scheduler] Iniciado — próxima execução: ${next.toUTCString()} (08h BRT)`
    );

    setTimeout(async () => {
      console.log(
        `[CRM Scheduler] ${new Date().toLocaleString("pt-BR", { timeZone: "UTC" })} (horário UTC)`
      );
      await checkAsaasOverdue();
      scheduleNext(); // reagenda para o próximo dia
    }, delay);
  }

  scheduleNext();
}
