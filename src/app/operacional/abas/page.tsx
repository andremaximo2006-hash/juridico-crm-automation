"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Loader2, FileText, Users, Briefcase, Baby } from "lucide-react";

interface TabData {
  id: string;
  cliente: string;
  [key: string]: any;
}

const ABAS_CONFIG = [
  { id: "cadsenha", label: "🔐 CADSENHA", title: "Cadastro de Senha", icon: FileText },
  { id: "iniciais", label: "📝 INICIAIS", title: "Petições Iniciais", icon: FileText },
  { id: "salmaternidade", label: "👶 SAL. MATERNIDADE", title: "Salário Maternidade", icon: Baby },
  { id: "pagina16", label: "📄 PÁGINA 16", title: "Dados Especiais", icon: FileText },
];

export default function AbasOperacionalPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "cadsenha";

  const [activeTab, setActiveTab] = useState(tabParam);
  const [data, setData] = useState<{ [key: string]: TabData[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    loadAllTabs();
  }, []);

  const loadAllTabs = async () => {
    setLoading(true);
    try {
      const [cadsenha, iniciais, pagina16, salmaternidade] = await Promise.all([
        fetch("/api/abas/cadsenha").then(r => r.json()).catch(() => ({ data: [] })),
        fetch("/api/abas/iniciais").then(r => r.json()).catch(() => ({ data: [] })),
        fetch("/api/abas/pagina16").then(r => r.json()).catch(() => ({ data: [] })),
        fetch("/api/abas/salmaternidade").then(r => r.json()).catch(() => ({ data: [] }))
      ]);

      setData({
        cadsenha: cadsenha.data || [],
        iniciais: iniciais.data || [],
        pagina16: pagina16.data || [],
        salmaternidade: salmaternidade.data || []
      });
    } catch (error) {
      console.error("Erro ao carregar abas:", error);
    } finally {
      setLoading(false);
    }
  };

  const TabContent = ({ abaKey, title }: { abaKey: string; title: string }) => {
    const items = data[abaKey] || [];

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={40} />
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total: {items.length} registros</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum registro nesta aba</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left text-sm font-semibold">Cliente</th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left text-sm font-semibold">Status/Tipo</th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left text-sm font-semibold">Área</th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left text-sm font-semibold">Benefício</th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left text-sm font-semibold">Data</th>
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 100).map((item) => (
                  <tr key={item.id} className="border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="border border-gray-300 dark:border-gray-700 p-3 text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">{item.cliente}</span>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3 text-sm">
                      <span className="inline-block px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
                        {item.status || item.tipoRequerimento || "-"}
                      </span>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.area || "-"}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.beneficio || "-"}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length > 100 && (
              <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Mostrando 100 de {items.length} registros
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const currentAba = ABAS_CONFIG.find(a => a.id === activeTab) || ABAS_CONFIG[0];

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title="Operacional - Abas"
        subtitle="Visualização detalhada de cada aba de processamento"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Tabs Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            {ABAS_CONFIG.map((aba) => (
              <button
                key={aba.id}
                onClick={() => setActiveTab(aba.id)}
                className={`p-4 rounded-lg font-semibold transition ${
                  activeTab === aba.id
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="text-base">{aba.label}</div>
                <div className="text-xs mt-1 opacity-75">
                  {data[aba.id]?.length || 0} registros
                </div>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <TabContent
              abaKey={activeTab}
              title={currentAba.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
