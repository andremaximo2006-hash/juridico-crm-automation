import { Loader2 } from "lucide-react";
import { STATUS_LABELS, CORES_KANBAN } from "@/types/operacional";
import type { FichaCard as FichaCardType, KanbanColuna } from "@/types/operacional";
import { FichaCard } from "./FichaCard";

interface KanbanBoardProps {
  fichas: FichaCardType[];
  onMove: (id: string, coluna: KanbanColuna) => Promise<void>;
  onEdit: (ficha: FichaCardType) => void;
  loading: boolean;
}

const COLUNAS: KanbanColuna[] = ["novo", "triagem", "andamento", "concluido"];

export function KanbanBoard({ fichas, onMove, onEdit, loading }: KanbanBoardProps) {
  const fichasByColuna = Object.fromEntries(
    COLUNAS.map((col) => [col, fichas.filter((f) => f.coluna === col)])
  ) as Record<KanbanColuna, FichaCardType[]>;

  return (
    <div className="flex-1 overflow-x-auto bg-gray-50 dark:bg-gray-800 p-4">
      <div className="grid grid-cols-4 gap-4 min-w-max" style={{ width: "100%" }}>
        {COLUNAS.map((coluna) => {
          const config = CORES_KANBAN[coluna];
          const cards = fichasByColuna[coluna];

          return (
            <div key={coluna} className="flex flex-col bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
              {/* Column Header */}
              <div
                className={`${config.bg} px-4 py-3 border-b-4`}
                style={{ borderBottomColor: config.hex }}
              >
                <h2 className="font-semibold text-gray-900 dark:text-white text-base">
                  {STATUS_LABELS[coluna]}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{cards.length} fichas</p>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-2 p-3 min-h-[500px]">
                {cards.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                    <p className="text-sm">Nenhuma ficha aqui</p>
                  </div>
                ) : (
                  cards.map((ficha) => (
                    <div key={ficha.id} className="group">
                      <FichaCard ficha={ficha} onClick={() => onEdit(ficha)} />

                      {/* Action Buttons */}
                      {!loading && ficha.podeAvançarColuna && coluna !== "concluido" && (
                        <div className="hidden group-hover:flex gap-1 mt-1 text-xs">
                          {coluna === "novo" && (
                            <button
                              onClick={() => onMove(ficha.id, "triagem")}
                              className="flex-1 px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                            >
                              → Triagem
                            </button>
                          )}
                          {coluna === "triagem" && (
                            <button
                              onClick={() =>
                                ficha.bloqueadoMoverAndamento ? alert("CadSenha obrigatória") : onMove(ficha.id, "andamento")
                              }
                              className="flex-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                              disabled={ficha.bloqueadoMoverAndamento}
                            >
                              → Andamento
                            </button>
                          )}
                          {coluna === "andamento" && (
                            <button
                              onClick={() => onMove(ficha.id, "concluido")}
                              className="flex-1 px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                            >
                              → Concluído
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
