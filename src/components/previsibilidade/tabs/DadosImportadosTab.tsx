"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface ImportLog {
  id: string;
  arquivo: string;
  data: string;
  status: "sucesso" | "erro" | "pendente";
  linhas: number;
  mensagem: string;
}

const IMPORTS_EXEMPLO: ImportLog[] = [
  {
    id: "1",
    arquivo: "campanhas_maio_2026.csv",
    data: "2026-05-30 10:15",
    status: "sucesso",
    linhas: 24,
    mensagem: "Importação concluída com sucesso",
  },
  {
    id: "2",
    arquivo: "leads_maio_2026.xlsx",
    data: "2026-05-28 14:32",
    status: "sucesso",
    linhas: 156,
    mensagem: "156 leads importados",
  },
  {
    id: "3",
    arquivo: "clientes_maio_2026.csv",
    data: "2026-05-25 09:45",
    status: "sucesso",
    linhas: 42,
    mensagem: "42 clientes adicionados",
  },
];

export function DadosImportadosTab() {
  const [imports, setImports] = useState<ImportLog[]>(IMPORTS_EXEMPLO);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Simular upload
    setTimeout(() => {
      const newImport: ImportLog = {
        id: String(imports.length + 1),
        arquivo: file.name,
        data: new Date().toLocaleString("pt-BR"),
        status: "sucesso",
        linhas: Math.floor(Math.random() * 100) + 10,
        mensagem: "Importação concluída com sucesso",
      };
      setImports([newImport, ...imports]);
      setUploading(false);
      e.target.value = "";
    }, 1000);
  };

  const StatusIcon = ({ status }: { status: "sucesso" | "erro" | "pendente" }) => {
    if (status === "sucesso") {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (status === "erro") {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  const StatusBg = ({ status }: { status: "sucesso" | "erro" | "pendente" }) => {
    if (status === "sucesso") {
      return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900";
    }
    if (status === "erro") {
      return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900";
    }
    return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        📌 DADOS IMPORTADOS — Histórico de Sincronizações
      </h3>

      {/* Upload Card */}
      <div className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-8 dark:border-blue-900 dark:bg-blue-900/20 text-center">
        <label className="cursor-pointer flex flex-col items-center gap-3">
          <Upload className="w-8 h-8 text-blue-600" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-200">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
              Formatos aceitos: CSV, XLSX, JSON
            </p>
          </div>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            accept=".csv,.xlsx,.json"
            className="hidden"
          />
        </label>
      </div>

      {/* Status Upload */}
      {uploading && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 p-4">
          <p className="text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            Processando arquivo...
          </p>
        </div>
      )}

      {/* Histórico de Importações */}
      <div>
        <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
          📂 Últimas Importações
        </h4>
        <div className="space-y-3">
          {imports.map((imp) => (
            <div
              key={imp.id}
              className={`rounded-lg border p-4 flex items-start gap-4 ${StatusBg({ status: imp.status })}`}
            >
              <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {imp.arquivo}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {imp.data}
                    </p>
                  </div>
                  <StatusIcon status={imp.status} />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                  {imp.mensagem}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {imp.linhas} linhas processadas
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orientações */}
      <div className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h4 className="font-semibold text-slate-900 dark:text-white">
          📋 Formatos e Estruturas Esperadas
        </h4>

        <div>
          <h5 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
            📊 CSV de Campanhas
          </h5>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-slate-800 p-3 rounded">
            mês, canal, produto, campanha, investimento, impressões, cliques, leads
          </p>
        </div>

        <div>
          <h5 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
            📊 CSV de Leads
          </h5>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-slate-800 p-3 rounded">
            data, origem, produto, cliente, leads, atendimentos, contratos, honorario
          </p>
        </div>

        <div>
          <h5 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
            📊 CSV de Fechamentos
          </h5>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-slate-800 p-3 rounded">
            data, cliente, produto, area, status, honorarios, observacoes
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          💡 <strong>Como usar:</strong> Importe dados de seus sistemas (CRM, ferramentas de publicidade, planilhas) em CSV/XLSX para consolidar na previsibilidade. Todos os dados são sincronizados automaticamente.
        </p>
      </div>
    </div>
  );
}
