"use client";

import { useRef, useState } from "react";
import { Upload, X, Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportModal({ onClose, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  function handleFile(f: File) {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext ?? "")) {
      alert("Formato não suportado. Use .xlsx, .xls ou .csv");
      return;
    }
    setFile(f);
    setResult(null);
  }

  function downloadTemplate() {
    const csv =
      "nome,cpf,telefone,email,profissao\n" +
      "Maria Silva,123.456.789-09,(11) 98765-4321,maria@email.com,Professora\n" +
      "João Costa,987.654.321-00,(21) 91234-5678,,Engenheiro\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo_importacao_clientes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/clientes/import", { method: "POST", body: fd });
      const data: ImportResult = await res.json();
      setResult(data);
      if (data.imported > 0) onSuccess();
    } catch {
      alert("Erro ao enviar arquivo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Importar Planilha de Clientes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Template download */}
          <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
            <div>
              <p className="text-sm font-medium text-blue-800">Baixe o modelo de planilha</p>
              <p className="text-xs text-blue-600">Colunas: nome, cpf, telefone, email, profissao</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-1.5 text-sm text-blue-700 font-medium hover:text-blue-900"
            >
              <Download size={15} /> Modelo CSV
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragging ? "border-blue-400 bg-blue-50" : file ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <Upload size={32} className={`mx-auto mb-2 ${file ? "text-green-500" : "text-gray-400"}`} />
            {file ? (
              <div>
                <p className="text-sm font-medium text-green-700">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB — clique para trocar</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">Arraste ou clique para selecionar</p>
                <p className="text-xs text-gray-400">.xlsx, .xls ou .csv</p>
              </div>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className="space-y-2">
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-2 bg-green-50 rounded-lg p-3">
                  <CheckCircle size={18} className="text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Importados</p>
                    <p className="text-xl font-bold text-green-700">{result.imported}</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2 bg-yellow-50 rounded-lg p-3">
                  <AlertCircle size={18} className="text-yellow-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Ignorados</p>
                    <p className="text-xl font-bold text-yellow-700">{result.skipped}</p>
                  </div>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <p className="text-xs font-medium text-gray-600 mb-1">Detalhes dos ignorados:</p>
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-xs text-gray-500">{e}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-5 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {result ? "Fechar" : "Cancelar"}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Importando...</> : "Importar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
