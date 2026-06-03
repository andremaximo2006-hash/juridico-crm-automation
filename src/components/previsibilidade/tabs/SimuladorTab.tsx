"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

interface CenarioSimulado {
  nomeInvestimento: number;
  estTaxa: number;
  estCPL: number;
  estLeads: number;
  estAtendimentos: number;
  estContratos: number;
  estFatPotencial: number;
  estFatPrevisto: number;
  estRoas: number;
}

const VALORES_PADRAO = {
  investimento: 2500,
  taxaConversao: 0.08,
  honorarioMedio: 5500,
};

export function SimuladorTab() {
  const [investimento, setInvestimento] = useState(VALORES_PADRAO.investimento);
  const [taxaConversao, setTaxaConversao] = useState(VALORES_PADRAO.taxaConversao);
  const [honorarioMedio, setHonorarioMedio] = useState(VALORES_PADRAO.honorarioMedio);

  // Cálculos simulados
  const calcLeads = () => Math.round(investimento / 26); // CPL média de 26
  const calcAtendimentos = () => Math.round(calcLeads() * 0.16); // 16% conversão leads → atendimentos
  const calcContratos = () => Math.round(calcAtendimentos() * taxaConversao); // taxa de conversão user
  const calcFatPotencial = () => calcContratos() * honorarioMedio;
  const calcFatPrevisto = () => Math.round(calcFatPotencial() * 0.65); // 65% prob recebimento
  const calcRoas = () => (investimento > 0 ? (calcFatPrevisto() / investimento).toFixed(2) : "0");

  const leads = calcLeads();
  const atendimentos = calcAtendimentos();
  const contratos = calcContratos();
  const fatPotencial = calcFatPotencial();
  const fatPrevisto = calcFatPrevisto();
  const roas = calcRoas();

  const resetSimulador = () => {
    setInvestimento(VALORES_PADRAO.investimento);
    setTaxaConversao(VALORES_PADRAO.taxaConversao);
    setHonorarioMedio(VALORES_PADRAO.honorarioMedio);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            🔮 SIMULADOR — Teste Cenários
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Ajuste variáveis e veja o impacto no faturamento em tempo real
          </p>
        </div>
        <button
          onClick={resetSimulador}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Resetar
        </button>
      </div>

      {/* Controles */}
      <div className="grid grid-cols-3 gap-6">
        {/* Investimento */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
            💰 Investimento Mensal
          </label>
          <div className="space-y-3">
            <input
              type="range"
              min="1000"
              max="10000"
              step="100"
              value={investimento}
              onChange={(e) => setInvestimento(Number(e.target.value))}
              className="w-full h-2 bg-yellow-300 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex items-center justify-between">
              <input
                type="number"
                value={investimento}
                onChange={(e) => setInvestimento(Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900 text-sm font-medium"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 ml-3">R$</span>
            </div>
            <p className="text-xs text-slate-500">Min: R$ 1.000 | Máx: R$ 10.000</p>
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
            📊 Taxa Conversão (Atendimento → Contrato)
          </label>
          <div className="space-y-3">
            <input
              type="range"
              min="0.05"
              max="0.20"
              step="0.01"
              value={taxaConversao}
              onChange={(e) => setTaxaConversao(Number(e.target.value))}
              className="w-full h-2 bg-blue-300 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex items-center justify-between">
              <input
                type="number"
                min="0.05"
                max="0.20"
                step="0.01"
                value={taxaConversao}
                onChange={(e) => setTaxaConversao(Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded border border-blue-300 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900 text-sm font-medium"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 ml-3">{(taxaConversao * 100).toFixed(0)}%</span>
            </div>
            <p className="text-xs text-slate-500">Min: 5% | Máx: 20%</p>
          </div>
        </div>

        {/* Honorário Médio */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
            💎 Honorário Médio por Contrato
          </label>
          <div className="space-y-3">
            <input
              type="range"
              min="3000"
              max="10000"
              step="100"
              value={honorarioMedio}
              onChange={(e) => setHonorarioMedio(Number(e.target.value))}
              className="w-full h-2 bg-purple-300 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex items-center justify-between">
              <input
                type="number"
                value={honorarioMedio}
                onChange={(e) => setHonorarioMedio(Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded border border-purple-300 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-900 text-sm font-medium"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 ml-3">R$</span>
            </div>
            <p className="text-xs text-slate-500">Min: R$ 3.000 | Máx: R$ 10.000</p>
          </div>
        </div>
      </div>

      {/* Resultados Simulados */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20 p-4">
          <p className="text-xs uppercase font-semibold text-yellow-900 dark:text-yellow-200">Leads Esperados</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{leads}</p>
        </div>
        <div className="rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-900/20 p-4">
          <p className="text-xs uppercase font-semibold text-purple-900 dark:text-purple-200">Atendimentos</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{atendimentos}</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20 p-4">
          <p className="text-xs uppercase font-semibold text-green-900 dark:text-green-200">Contratos</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{contratos}</p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20 p-4">
          <p className="text-xs uppercase font-semibold text-blue-900 dark:text-blue-200">ROAS</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{roas}x</p>
        </div>
      </div>

      {/* Resultado Final */}
      <div className="rounded-lg border-2 border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-900/30 p-6">
        <h4 className="font-semibold text-green-900 dark:text-green-200 mb-4">
          📈 Projeção de Faturamento
        </h4>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-green-800 dark:text-green-300">Faturamento Potencial</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              R$ {fatPotencial.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="border-l border-green-300"></div>
          <div>
            <p className="text-sm text-green-800 dark:text-green-300">Faturamento Previsto (65% recebimento)</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              R$ {fatPrevisto.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="border-l border-green-300"></div>
          <div>
            <p className="text-sm text-green-800 dark:text-green-300">Custo de Aquisição (CPL)</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              R$ {(investimento / leads).toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          💡 <strong>Como usar:</strong> Ajuste investimento, taxa de conversão e honorário para ver o impacto no faturamento esperado. Use para planejar cenários otimistas/pessimistas.
        </p>
      </div>
    </div>
  );
}
