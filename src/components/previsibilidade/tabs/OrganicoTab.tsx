"use client";

import { useState, useEffect, useMemo } from "react";
import { RefreshCw } from "lucide-react";

interface Fechamento {
  id: string;
  data: string;
  cliente: string;
  produtoId: string;
  area: string;
  canal: string;
  setor: string;
  obs: string;
  situacao: string;
  honorarios: number;
}

interface OrganicoAgrupado {
  mes: string;
  origem: string;
  contratos: number;
  honorarioMedio: number;
  totalHonorarios: number;
}

export function OrganicoTab() {
  const [fechamentos, setFechamentos] = useState<Fechamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados dos Fechamentos
  useEffect(() => {
    const fetchFechamentos = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/previsibilidade/fechamentos");
        if (!response.ok) throw new Error("Erro ao buscar fechamentos");
        const data = await response.json();
        setFechamentos(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchFechamentos();
  }, []);

  // Agrupar por mês + origem (Seção C de Indicação)
  const organicosAgrupados = useMemo(() => {
    // Filtrar apenas orgânicos
    const organicos = fechamentos.filter((f) => f.canal === "organico");

    // Agrupar por mês + origem (obs)
    const mapa = new Map<string, OrganicoAgrupado>();

    organicos.forEach((fech) => {
      const mes = fech.data.substring(0, 7); // YYYY-MM
      const origem = fech.obs || "Sem origem";
      const chave = `${mes}|${origem}`;

      // Converter honorarios para número com segurança
      const honorariosNum = typeof fech.honorarios === 'string'
        ? parseFloat(fech.honorarios)
        : (fech.honorarios || 0);
      const honorariosValido = isNaN(honorariosNum) ? 0 : honorariosNum;

      const existente = mapa.get(chave);
      if (existente) {
        existente.contratos += 1;
        existente.totalHonorarios += honorariosValido;
        existente.honorarioMedio = existente.totalHonorarios / existente.contratos;
      } else {
        mapa.set(chave, {
          mes,
          origem,
          contratos: 1,
          honorarioMedio: honorariosValido,
          totalHonorarios: honorariosValido,
        });
      }
    });

    return Array.from(mapa.values()).sort((a, b) => b.mes.localeCompare(a.mes));
  }, [fechamentos]);

  // Formatação de moeda
  const formatarMoeda = (valor: number): string => {
    if (!valor && valor !== 0) return "—";
    const numValue = typeof valor === "string" ? parseFloat(valor) : valor;
    if (isNaN(numValue)) return "—";
    return `R$ ${numValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleReload = () => {
    setLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            🌱 ORGÂNICOS POR MÊS DE INDICAÇÃO
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Referência automática dos Fechamentos (canal = orgânico) agrupado por mês e origem
          </p>
        </div>
        <button
          onClick={handleReload}
          disabled={loading}
          className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Recarregar
        </button>
      </div>

      {/* Estado de carregamento */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-slate-600 dark:text-slate-400">⏳ Carregando dados...</p>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200 border border-red-200 dark:border-red-900">
          <p>❌ {error}</p>
        </div>
      )}

      {/* Tabela de Orgânicos */}
      {!loading && !error && (
        <>
          {organicosAgrupados.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-8 text-center dark:bg-slate-800">
              <p className="text-slate-600 dark:text-slate-400">
                📭 Nenhum contrato com canal "orgânico" encontrado
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-gray-100 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left font-semibold">Mês</th>
                    <th className="px-4 py-3 text-left font-semibold">Origem da Indicação</th>
                    <th className="px-4 py-3 text-right font-semibold bg-yellow-50 dark:bg-yellow-900/10">Contratos</th>
                    <th className="px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/10">Honorário Médio</th>
                    <th className="px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/10">Total Honorários</th>
                  </tr>
                </thead>
                <tbody>
                  {organicosAgrupados.map((org, idx) => (
                    <tr key={idx} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{org.mes}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{org.origem}</td>
                      <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10 font-medium text-slate-900 dark:text-white">
                        {org.contratos}
                      </td>
                      <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium text-slate-900 dark:text-white">
                        {formatarMoeda(org.honorarioMedio)}
                      </td>
                      <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium text-green-600">
                        {formatarMoeda(org.totalHonorarios)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Resumo */}
          {organicosAgrupados.length > 0 && (
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Total de Indicações (Orgânicos)</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {organicosAgrupados.reduce((sum, org) => sum + org.contratos, 0)} contratos
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Total de Honorários</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatarMoeda(organicosAgrupados.reduce((sum, org) => sum + org.totalHonorarios, 0))}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              ℹ️ Seção C de Indicação — Dados automáticos da aba Fechamentos, filtrados por canal = "orgânico",
              agrupados por mês e origem (campo Obs).
            </p>
          </div>
        </>
      )}
    </div>
  );
}
