import { AlertCircle, Phone } from "lucide-react";
import { CORES_PRIORIDADE, CORES_AREA, CORES_NATUREZA, RESPONSAVEL_NOMES } from "@/types/operacional";
import type { FichaCard as FichaCardType } from "@/types/operacional";
import { AvatarBadge } from "./AvatarBadge";

interface FichaCardProps {
  ficha: FichaCardType;
  onClick: () => void;
}

export function FichaCard({ ficha, onClick }: FichaCardProps) {
  const prioridadeConfig = CORES_PRIORIDADE[ficha.prioridade];
  const areaConfig = CORES_AREA[ficha.area];
  const naturezaConfig = CORES_NATUREZA[ficha.natureza];

  const dataFormatada = new Date(ficha.dataEntrada).toLocaleDateString("pt-BR", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      onClick={onClick}
      className={`
        border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md
        ${prioridadeConfig.bg} border-gray-200 dark:border-gray-700
      `}
    >
      {/* Priority Badge */}
      {prioridadeConfig.label && (
        <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 `} style={{ color: prioridadeConfig.text }}>
          {prioridadeConfig.label}
        </div>
      )}

      {/* Client Name */}
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{ficha.nome}</h3>

      {/* Area & Beneficio */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {ficha.area} — {ficha.beneficio}
      </p>

      {/* Process Number */}
      {ficha.numeroProcesso && (
        <p className="text-xs font-mono text-gray-600 dark:text-gray-300 mb-2 break-all">{ficha.numeroProcesso}</p>
      )}

      {/* DPP highlight for SM */}
      {ficha.diasAte_DPP !== undefined && ficha.diasAte_DPP <= 30 && (
        <div className="bg-yellow-100 border border-yellow-400 rounded px-2 py-1 text-xs mb-2 text-yellow-800">
          DPP: {ficha.smDpp ? new Date(ficha.smDpp).toLocaleDateString("pt-BR") : "—"} ({ficha.diasAte_DPP}d)
        </div>
      )}

      {/* CadSenha highlight */}
      {ficha.cadSenha && ficha.cadSenha !== "OK" && (
        <div className="bg-orange-100 border border-orange-400 rounded px-2 py-1 text-xs mb-2 text-orange-800">
          CadSenha: {ficha.cadSenha}
        </div>
      )}

      {/* Observações (70 chars) */}
      {ficha.observacoes && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{ficha.observacoes.substring(0, 70)}</p>
      )}

      {/* Alerts */}
      {ficha.alertas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded px-2 py-1 mb-2">
          {ficha.alertas.map((alerta: string, i: number) => (
            <div key={i} className="flex items-center gap-1 text-xs text-red-700">
              <AlertCircle size={12} />
              {alerta}
            </div>
          ))}
        </div>
      )}

      {/* Tags: Area, Natureza, Setor */}
      <div className="flex flex-wrap gap-1 mb-3">
        <span
          className="text-xs px-2 py-1 rounded"
          style={{ backgroundColor: areaConfig.bg, color: areaConfig.text, borderColor: areaConfig.border }}
        >
          {ficha.area}
        </span>
        <span
          className="text-xs px-2 py-1 rounded"
          style={{ backgroundColor: naturezaConfig.bg, color: naturezaConfig.text, borderColor: naturezaConfig.border }}
        >
          {ficha.natureza}
        </span>
        {ficha.setor && (
          <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {ficha.setor}
          </span>
        )}
      </div>

      {/* Footer: Avatar + Responsável + Data */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 min-w-0">
          <AvatarBadge responsavel={ficha.responsavel} size="sm" />
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {RESPONSAVEL_NOMES[ficha.responsavel]}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">{dataFormatada}</span>
      </div>

      {/* Contact button if WhatsApp */}
      {ficha.contato && (
        <a
          href={`https://wa.me/${ficha.contato.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 dark:text-green-400"
          onClick={(e) => e.stopPropagation()}
        >
          <Phone size={12} />
          WhatsApp
        </a>
      )}
    </div>
  );
}
