"use client";

export function InstrucoesTab() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          🏛️ PLANILHA DE PREVISIBILIDADE — ESCRITÓRIO DE ADVOCACIA
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Controle de Tráfego Pago + Orgânico · Funil Jurídico · Previsibilidade de Faturamento
        </p>

        <div className="space-y-6">
          {/* Legenda de Cores */}
          <div>
            <h3 className="font-semibold text-lg mb-3 text-slate-900 dark:text-white">📌 Legenda de Cores</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-300 rounded border border-slate-300"></div>
                <span className="text-sm"><strong>Amarelo:</strong> Campo de PREENCHIMENTO</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-300 rounded border border-slate-300"></div>
                <span className="text-sm"><strong>Azul:</strong> Cálculo AUTOMÁTICO</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded border border-slate-300"></div>
                <span className="text-sm"><strong>Verde:</strong> Positivo / Meta atingida</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded border border-slate-300"></div>
                <span className="text-sm"><strong>Vermelho:</strong> Atenção / Abaixo da meta</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-400 rounded border border-slate-300"></div>
                <span className="text-sm"><strong>Laranja:</strong> Dados ORGÂNICOS</span>
              </div>
            </div>
          </div>

          {/* Passos */}
          <div>
            <h3 className="font-semibold text-lg mb-3 text-slate-900 dark:text-white">🚀 Como Usar Esta Planilha</h3>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-6">1️⃣</span>
                <div>
                  <p className="font-semibold">Configurações</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Ajuste produtos, honorários, taxas de conversão e orçamentos</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-6">2️⃣</span>
                <div>
                  <p className="font-semibold">Lançar Campanhas</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Registre campanhas pagas com dropdown para canal/produto/status</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-6">3️⃣</span>
                <div>
                  <p className="font-semibold">Lançar Orgânicos</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Registre leads de indicações, Instagram, SEO, etc.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-6">4️⃣</span>
                <div>
                  <p className="font-semibold">Ver Resumo Mensal</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Consolida tráfego pago + orgânico</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-6">5️⃣</span>
                <div>
                  <p className="font-semibold">Ver Dashboard</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">KPIs executivos (faturamento, ROAS, funil, alertas)</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-6">6️⃣</span>
                <div>
                  <p className="font-semibold">Usar Simulador</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Teste cenários alterando orçamento/produto</p>
                </div>
              </li>
            </ol>
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              💡 <strong>Dica:</strong> Todos os campos em AMARELO devem ser preenchidos por você. Os campos em AZUL calculam automaticamente com base nos dados que você inserir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
