import { useState } from "react";
import { X, ChevronDown, Loader2 } from "lucide-react";
import type { FichaCard, FichaFormData, AreaAtuacao, Responsavel } from "@/types/operacional";
import {
  AREAS_ATUACAO,
  BENEFICIOS,
  RESPONSAVEIS,
  SETORES,
  TIPOS_REQUERIMENTO,
  RESPONSAVEL_NOMES,
} from "@/types/operacional";
import { AvatarBadge } from "./AvatarBadge";

interface FichaModalProps {
  ficha: FichaCard | null;
  onSave: (data: FichaFormData) => Promise<void>;
  onClose: () => void;
}

interface ExpandedSections {
  cliente: boolean;
  processo: boolean;
  responsavel: boolean;
  documentacao: boolean;
  salarioMaternidade: boolean;
  observacoes: boolean;
}

export function FichaModal({ ficha, onSave, onClose }: FichaModalProps) {
  const isEdit = !!ficha;
  const [form, setForm] = useState<any>(
    ficha || {
      natureza: "LEAD",
      dataEntrada: new Date().toISOString().split("T")[0],
      coluna: "novo",
      prioridade: "normal",
    }
  );
  const [expanded, setExpanded] = useState<ExpandedSections>({
    cliente: true,
    processo: true,
    responsavel: true,
    documentacao: false,
    salarioMaternidade: false,
    observacoes: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key: string, value: any) => {
    setForm((f: any) => ({ ...f, [key]: value }));
    setError("");
  };

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpanded((e) => ({ ...e, [section]: !e[section] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSave(form as FichaFormData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const isSalarioMaternidade = form.beneficio?.includes("Salário Maternidade");
  const area = form.area as AreaAtuacao | undefined;
  const beneficios = area ? BENEFICIOS[area] : [];

  const SectionHeader = ({ title, icon, section }: { title: string; icon?: string; section: keyof ExpandedSections }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <ChevronDown size={18} className={`transition-transform ${expanded[section] ? "rotate-180" : ""}`} />
    </button>
  );

  const InputField = ({ label, ...props }: any) => (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {props.required && "*"}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );

  const SelectField = ({ label, options, value, onChange, required = false }: any) => (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && "*"}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">—</option>
        {options.map((opt: any) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? "Editar Ficha" : "Nova Ficha Operacional"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-0">
          {/* 1. Cliente */}
          <SectionHeader title="👤 Dados do Cliente" section="cliente" />
          {expanded.cliente && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 space-y-3 border-b dark:border-gray-700">
              <InputField
                label="Nome completo"
                value={form.nome || ""}
                onChange={(v: string) => handleChange("nome", v)}
                required
              />
              <InputField
                label="Contato (WhatsApp)"
                placeholder="(00) 00000-0000"
                value={form.contato || ""}
                onChange={(v: string) => handleChange("contato", v)}
              />
              <SelectField
                label="Natureza"
                options={["LEAD", "ORGÂNICO"]}
                value={form.natureza}
                onChange={(v: string) => handleChange("natureza", v)}
              />
            </div>
          )}

          {/* 2. Processo */}
          <SectionHeader title="📋 Dados do Processo" section="processo" />
          {expanded.processo && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 space-y-3 border-b dark:border-gray-700">
              <InputField
                label="Data de entrada"
                type="date"
                value={form.dataEntrada || ""}
                onChange={(v: string) => handleChange("dataEntrada", v)}
              />
              <SelectField
                label="Área de atuação"
                options={AREAS_ATUACAO}
                value={form.area}
                onChange={(v: string) => handleChange("area", v)}
                required
              />
              <SelectField
                label="Benefício"
                options={beneficios}
                value={form.beneficio}
                onChange={(v: string) => handleChange("beneficio", v)}
                required
              />
              <SelectField
                label="Tipo de requerimento"
                options={TIPOS_REQUERIMENTO}
                onChange={(v: string) => handleChange("tipoRequerimento", v)}
              />
              <InputField
                label="Nº do processo"
                placeholder="0000000-00.0000.0.00.0000"
                value={form.numeroProcesso || ""}
                onChange={(v: string) => handleChange("numeroProcesso", v)}
              />
              <InputField
                label="Data do protocolo"
                type="date"
                value={form.dataProtocolo ? form.dataProtocolo.toString().split("T")[0] : ""}
                onChange={(v: string) => handleChange("dataProtocolo", v)}
              />
              <InputField
                label="Nº do protocolo"
                value={form.numeroProtocolo || ""}
                onChange={(v: string) => handleChange("numeroProtocolo", v)}
              />
            </div>
          )}

          {/* 3. Responsável */}
          <SectionHeader title="⚖️ Responsável e Setor" section="responsavel" />
          {expanded.responsavel && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 space-y-3 border-b dark:border-gray-700">
              <SelectField
                label="Responsável"
                options={RESPONSAVEIS.map((r) => RESPONSAVEL_NOMES[r])}
                value={form.responsavel ? RESPONSAVEL_NOMES[form.responsavel as Responsavel] : ""}
                onChange={(v: string) => {
                  const resp = Object.entries(RESPONSAVEL_NOMES).find(([_, name]) => name === v)?.[0];
                  if (resp) handleChange("responsavel", resp);
                }}
                required
              />
              <SelectField
                label="Setor"
                options={SETORES}
                value={form.setor}
                onChange={(v: string) => handleChange("setor", v)}
              />
              <SelectField
                label="Prioridade"
                options={["baixa", "normal", "alta", "urgente"]}
                value={form.prioridade}
                onChange={(v: string) => handleChange("prioridade", v)}
              />
            </div>
          )}

          {/* 4. Documentação */}
          <SectionHeader title="📄 Documentação" section="documentacao" />
          {expanded.documentacao && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 space-y-3 border-b dark:border-gray-700">
              <SelectField
                label="CadSenha"
                options={["OK", "Pendente", "Aguardando assinatura", "Bloqueado", "Verificar"]}
                value={form.cadSenha}
                onChange={(v: string) => handleChange("cadSenha", v)}
              />
              <SelectField
                label="Conformidade"
                options={[
                  "OK",
                  "Pendente",
                  "Aguardando laudos médicos",
                  "Aguardando CadÚnico",
                  "Aguardando documentos",
                  "Sem viabilidade",
                  "Desistência",
                ]}
                value={form.conformidade}
                onChange={(v: string) => handleChange("conformidade", v)}
              />
            </div>
          )}

          {/* 5. Salário Maternidade (Conditional) */}
          {area === "Previdenciario" && isSalarioMaternidade && (
            <>
              <SectionHeader title="🤰 Salário Maternidade" section="salarioMaternidade" />
              {expanded.salarioMaternidade && (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 space-y-3 border-b dark:border-gray-700">
                  <SelectField
                    label="Contribuição"
                    options={["CI", "FBR"]}
                    value={form.smContribuicao}
                    onChange={(v: string) => handleChange("smContribuicao", v)}
                    required
                  />
                  <InputField
                    label="Data Prevista do Parto (DPP)"
                    type="date"
                    value={form.smDpp ? new Date(form.smDpp).toISOString().split("T")[0] : ""}
                    onChange={(v: string) => handleChange("smDpp", v)}
                    required
                  />
                  <SelectField
                    label="Quem paga"
                    options={["GN", "Cliente"]}
                    value={form.smQuemPaga}
                    onChange={(v: string) => handleChange("smQuemPaga", v)}
                  />
                  <SelectField
                    label="Status da guia"
                    options={[
                      "Guia emitida — aguardando pagamento",
                      "Guia emitida — pagamento realizado",
                      "Não emitida",
                    ]}
                    value={form.smStatusGuia}
                    onChange={(v: string) => handleChange("smStatusGuia", v)}
                  />
                </div>
              )}
            </>
          )}

          {/* 6. Observações */}
          <SectionHeader title="📝 Observações" section="observacoes" />
          {expanded.observacoes && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 space-y-3 border-b dark:border-gray-700">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observações livres
                </label>
                <textarea
                  value={form.observacoes || ""}
                  onChange={(e) => handleChange("observacoes", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {ficha?.historicoLog && (
                <div className="mb-3 p-3 bg-gray-200 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Histórico</p>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                    {ficha.historicoLog}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && <p className="text-red-600 dark:text-red-400 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded">{error}</p>}

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Salvando...
                </>
              ) : isEdit ? (
                "Salvar alterações"
              ) : (
                "Cadastrar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
