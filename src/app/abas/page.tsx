"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Loader2 } from "lucide-react";

interface TabData {
  id: string;
  cliente: string;
  [key: string]: any;
}

export default function AbasPage() {
  const [activeTab, setActiveTab] = useState("cadsenha");
  const [data, setData] = useState<{ [key: string]: TabData[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllTabs();
  }, []);

  const loadAllTabs = async () => {
    setLoading(true);
    try {
      // Carregar dados de todas as abas
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
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">Total: {items.length} registros</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhum registro nesta aba
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border p-3 text-left">Cliente</th>
                  <th className="border p-3 text-left">Status</th>
                  <th className="border p-3 text-left">Área</th>
                  <th className="border p-3 text-left">Benefício</th>
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 50).map((item) => (
                  <tr key={item.id} className="border hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="border p-3">{item.cliente}</td>
                    <td className="border p-3">
                      <span className="inline-block px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        {item.status || "-"}
                      </span>
                    </td>
                    <td className="border p-3">{item.area || "-"}</td>
                    <td className="border p-3">{item.beneficio || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length > 50 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                Mostrando 50 de {items.length} registros
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Abas" subtitle="Dados organizados conforme planilha original" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Tabs Navigation */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[
              { id: "cadsenha", label: "📋 CADSENHA", color: "blue" },
              { id: "iniciais", label: "📝 INICIAIS", color: "green" },
              { id: "salmaternidade", label: "👶 SAL. MATERNIDADE", color: "purple" },
              { id: "pagina16", label: "📄 PÁGINA 16", color: "yellow" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 rounded-lg font-semibold transition ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-600 text-white`
                    : `bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600`
                }`}
              >
                <div>{tab.label}</div>
                <div className="text-xs mt-1">
                  {data[tab.id as keyof typeof data]?.length || 0} registros
                </div>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {activeTab === "cadsenha" && <TabContent abaKey="cadsenha" title="CADSENHA - Cadastro de Senha" />}
            {activeTab === "iniciais" && <TabContent abaKey="iniciais" title="INICIAIS - Petições Iniciais" />}
            {activeTab === "salmaternidade" && <TabContent abaKey="salmaternidade" title="SALÁRIO MATERNIDADE" />}
            {activeTab === "pagina16" && <TabContent abaKey="pagina16" title="PÁGINA 16 - Dados Especiais" />}
          </div>
        </div>
      </div>
    </div>
  );
}
