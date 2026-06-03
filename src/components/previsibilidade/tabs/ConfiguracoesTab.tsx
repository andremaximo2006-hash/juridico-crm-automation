"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Copy } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AdicionarProdutoModal } from "../modals/AdicionarProdutoModal";
import { ConfirmacaoDeleteDialog } from "../dialogs/ConfirmacaoDeleteDialog";

// Seção A: PRODUTOS JURÍDICOS
interface Produto {
  id: string;
  nome: string;
  honorarioMedio: number;
  probRecebimento: number;
  custoOperac: number;
  metaFatMensal: number;
  convLeadAtend: number;
  convAtendContrato: number;
  cplRef: number;
}

// Seção B: CANAIS DE TRÁFEGO PAGO
interface CanalPago {
  id: string;
  nome: string;
  metaOrcamento: number;
  cpcMedio: number;
  convCliqueLead: number;
  cplMeta: number;
  retornoPercent: number;
  obs: string;
}

// Seção C: CANAIS ORGÂNICOS
interface CanalOrganico {
  id: string;
  nome: string;
  metaLeadsMes: number;
  convLeadAtend: number;
  convAtendContrato: number;
  obs: string;
}

const PRODUTOS_EXEMPLO: Produto[] = [
  {
    id: "1",
    nome: "BPC/LOAS",
    honorarioMedio: 6484,
    probRecebimento: 0.65,
    custoOperac: 0.22,
    metaFatMensal: 38591,
    convLeadAtend: 0.177,
    convAtendContrato: 1.0,
    cplRef: 545,
  },
  {
    id: "2",
    nome: "Aposentadoria",
    honorarioMedio: 5000,
    probRecebimento: 0.6,
    custoOperac: 0.2,
    metaFatMensal: 30000,
    convLeadAtend: 0.25,
    convAtendContrato: 0.8,
    cplRef: 480,
  },
];

const CANAIS_PAGO_EXEMPLO: CanalPago[] = [
  {
    id: "1",
    nome: "Meta Ads",
    metaOrcamento: 8000,
    cpcMedio: 2.5,
    convCliqueLead: 0.08,
    cplMeta: 180,
    retornoPercent: 0,
    obs: "Facebook/Instagram · remarketing",
  },
  {
    id: "2",
    nome: "Google Ads",
    metaOrcamento: 10000,
    cpcMedio: 6.0,
    convCliqueLead: 0.12,
    cplMeta: 200,
    retornoPercent: 0,
    obs: "Search + Display",
  },
  {
    id: "3",
    nome: "TikTok Ads",
    metaOrcamento: 4000,
    cpcMedio: 1.8,
    convCliqueLead: 0.05,
    cplMeta: 222,
    retornoPercent: 0,
    obs: "Vídeo curto - público jovem",
  },
];

const CANAIS_ORGANICO_EXEMPLO: CanalOrganico[] = [
  {
    id: "1",
    nome: "WhatsApp/Indicação",
    metaLeadsMes: 20,
    convLeadAtend: 0.45,
    convAtendContrato: 0.35,
    obs: "Leads mais quentes",
  },
  {
    id: "2",
    nome: "Instagram",
    metaLeadsMes: 15,
    convLeadAtend: 0.3,
    convAtendContrato: 0.25,
    obs: "Posts e stories",
  },
];

export function ConfiguracoesTab() {
  const [produtos, setProdutos] = useLocalStorage<Produto[]>(
    "previsibilidade_produtos",
    PRODUTOS_EXEMPLO
  );
  const [canaisPago, setCanaisPago] = useLocalStorage<CanalPago[]>(
    "previsibilidade_canais_pago",
    CANAIS_PAGO_EXEMPLO
  );
  const [canaisOrganico, setCanaisOrganico] = useLocalStorage<CanalOrganico[]>(
    "previsibilidade_canais_organico",
    CANAIS_ORGANICO_EXEMPLO
  );

  // Modal de Produto
  const [openProdutoModal, setOpenProdutoModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    type: "produto" | "canal_pago" | "canal_organico";
  }>({ open: false, id: "", type: "produto" });

  // Handlers Produtos
  const handleAddProduto = (data: Omit<Produto, "id">) => {
    const newProduto: Produto = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setProdutos([...produtos, newProduto]);
  };

  const handleEditProduto = (data: Omit<Produto, "id">) => {
    if (editingProduto) {
      setProdutos(
        produtos.map((p) =>
          p.id === editingProduto.id ? { ...p, ...data } : p
        )
      );
      setEditingProduto(null);
    }
  };

  const handleDeleteProduto = (id: string) => {
    setProdutos(produtos.filter((p) => p.id !== id));
  };

  const handleDuplicateProduto = (id: string) => {
    const produtoToDuplicate = produtos.find((p) => p.id === id);
    if (produtoToDuplicate) {
      const newProduto: Produto = {
        ...produtoToDuplicate,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nome: `${produtoToDuplicate.nome} (Cópia)`,
      };
      setProdutos([...produtos, newProduto]);
    }
  };

  const handleSaveProduto = (data: Omit<Produto, "id">) => {
    if (editingProduto) {
      handleEditProduto(data);
    } else {
      handleAddProduto(data);
    }
    setOpenProdutoModal(false);
  };

  const openEditProduto = (produto: Produto) => {
    setEditingProduto(produto);
    setOpenProdutoModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* SEÇÃO A: PRODUTOS JURÍDICOS */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            📋 Seção A: PRODUTOS JURÍDICOS
          </h3>
          <button
            onClick={() => {
              setEditingProduto(null);
              setOpenProdutoModal(true);
            }}
            className="flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Adicionar Produto
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 text-left font-semibold">Produto</th>
                <th className="px-4 py-2 text-right font-semibold">Honorário (R$)</th>
                <th className="px-4 py-2 text-right font-semibold">Prob. Receb.</th>
                <th className="px-4 py-2 text-right font-semibold">Custo Op.</th>
                <th className="px-4 py-2 text-right font-semibold">Meta Fat.</th>
                <th className="px-4 py-2 text-right font-semibold">Conv. L→A</th>
                <th className="px-4 py-2 text-right font-semibold">Conv. A→C</th>
                <th className="px-4 py-2 text-right font-semibold">CPL Ref.</th>
                <th className="px-4 py-2 text-center font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto) => (
                <tr
                  key={produto.id}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 font-medium text-slate-900 dark:text-white">
                    {produto.nome}
                  </td>
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 text-right text-slate-900 dark:text-white">
                    R$ {produto.honorarioMedio.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 text-right text-slate-900 dark:text-white">
                    {(produto.probRecebimento * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 text-right text-slate-900 dark:text-white">
                    {(produto.custoOperac * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 text-right text-slate-900 dark:text-white">
                    R$ {produto.metaFatMensal.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 text-right text-slate-900 dark:text-white">
                    {(produto.convLeadAtend * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 text-right text-slate-900 dark:text-white">
                    {(produto.convAtendContrato * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 text-right text-slate-900 dark:text-white">
                    R$ {produto.cplRef.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => openEditProduto(produto)}
                      className="inline-text-blue-600 hover:text-blue-700"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({ open: true, id: produto.id, type: "produto" })
                      }
                      className="inline-text-red-600 hover:text-red-700"
                      title="Deletar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateProduto(produto.id)}
                      className="inline-text-green-600 hover:text-green-700"
                      title="Duplicar"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEÇÃO B: CANAIS DE TRÁFEGO PAGO */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          🔵 Seção B: CANAIS DE TRÁFEGO PAGO
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 text-left font-semibold">Canal</th>
                <th className="px-4 py-2 text-right font-semibold">Meta Orçamento</th>
                <th className="px-4 py-2 text-right font-semibold">CPC Médio</th>
                <th className="px-4 py-2 text-right font-semibold">Conv. Clique→Lead</th>
                <th className="px-4 py-2 text-right font-semibold">CPL Meta</th>
                <th className="px-4 py-2 text-left font-semibold">Observações</th>
              </tr>
            </thead>
            <tbody>
              {canaisPago.map((canal) => (
                <tr
                  key={canal.id}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 font-medium text-slate-900 dark:text-white">
                    {canal.nome}
                  </td>
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 text-right text-slate-900 dark:text-white">
                    R$ {canal.metaOrcamento.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 text-right text-slate-900 dark:text-white">
                    R$ {canal.cpcMedio.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 text-right text-slate-900 dark:text-white">
                    {(canal.convCliqueLead * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 text-right text-slate-900 dark:text-white">
                    R$ {canal.cplMeta.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{canal.obs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEÇÃO C: CANAIS ORGÂNICOS */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          🟠 Seção C: CANAIS ORGÂNICOS
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 text-left font-semibold">Canal Orgânico</th>
                <th className="px-4 py-2 text-right font-semibold">Meta Leads/Mês</th>
                <th className="px-4 py-2 text-right font-semibold">Conv. Lead→Atend</th>
                <th className="px-4 py-2 text-right font-semibold">Conv. Atend→Contrato</th>
                <th className="px-4 py-2 text-left font-semibold">Observações</th>
              </tr>
            </thead>
            <tbody>
              {canaisOrganico.map((canal) => (
                <tr
                  key={canal.id}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 font-medium text-slate-900 dark:text-white">
                    {canal.nome}
                  </td>
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 text-right text-slate-900 dark:text-white">
                    {canal.metaLeadsMes}
                  </td>
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 text-right text-slate-900 dark:text-white">
                    {(canal.convLeadAtend * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 text-right text-slate-900 dark:text-white">
                    {(canal.convAtendContrato * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{canal.obs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AdicionarProdutoModal
        open={openProdutoModal}
        onOpenChange={(open) => {
          setOpenProdutoModal(open);
          if (!open) setEditingProduto(null);
        }}
        onSave={handleSaveProduto}
        editingProduto={editingProduto}
        existingNomes={produtos.map((p) => p.nome)}
      />

      <ConfirmacaoDeleteDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Deletar Produto?"
        description="Esta ação não pode ser desfeita. O produto será permanentemente removido."
        onConfirm={() => {
          if (deleteConfirm.type === "produto") {
            handleDeleteProduto(deleteConfirm.id);
          }
          setDeleteConfirm({ open: false, id: "", type: "produto" });
        }}
      />

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          💡 <strong>Dica:</strong> Edite os valores em AMARELO conforme os dados reais do seu escritório. Eles serão usados nos cálculos automáticos das outras abas.
        </p>
      </div>
    </div>
  );
}
