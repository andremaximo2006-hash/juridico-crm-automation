"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Copy } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AdicionarOrganicoModal } from "../modals/AdicionarOrganicoModal";
import { ConfirmacaoDeleteDialog } from "../dialogs/ConfirmacaoDeleteDialog";

interface Organico {
  id: string;
  mes: string;
  canalOrganico: string;
  produto: string;
  origemEspecifica: string;
  leads: number;
  atendimentos: number;
  contratos: number;
}

const ORGANICO_EXEMPLO: Organico[] = [
  {
    id: "1",
    mes: "2026-05",
    canalOrganico: "WhatsApp/Indicação",
    produto: "BPC/LOAS",
    origemEspecifica: "Indicação do cliente X",
    leads: 12,
    atendimentos: 5,
    contratos: 3,
  },
];

const PRODUTOS_CONFIG = {
  "BPC/LOAS": { honorario: 6484, prob: 0.65 },
  "Aposentadoria": { honorario: 5000, prob: 0.6 },
};

export function OrganicoTab() {
  const [organicos, setOrganicos] = useLocalStorage<Organico[]>(
    "previsibilidade_organicos",
    ORGANICO_EXEMPLO
  );

  const [openModal, setOpenModal] = useState(false);
  const [editingOrganico, setEditingOrganico] = useState<Organico | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string }>({
    open: false,
    id: "",
  });

  const handleAdd = (data: Omit<Organico, "id">) => {
    const newOrganico: Organico = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setOrganicos([...organicos, newOrganico]);
  };

  const handleEdit = (data: Omit<Organico, "id">) => {
    if (editingOrganico) {
      setOrganicos(organicos.map((o) => (o.id === editingOrganico.id ? { ...o, ...data } : o)));
      setEditingOrganico(null);
    }
  };

  const handleDelete = (id: string) => {
    setOrganicos(organicos.filter((o) => o.id !== id));
  };

  const handleDuplicate = (id: string) => {
    const orgToDuplicate = organicos.find((o) => o.id === id);
    if (orgToDuplicate) {
      const newOrganico: Organico = {
        ...orgToDuplicate,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        origemEspecifica: `${orgToDuplicate.origemEspecifica} (Cópia)`,
      };
      setOrganicos([...organicos, newOrganico]);
    }
  };

  const handleSave = (data: Omit<Organico, "id">) => {
    if (editingOrganico) {
      handleEdit(data);
    } else {
      handleAdd(data);
    }
    setOpenModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            🌱 LEADS ORGÂNICOS
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">WhatsApp, Instagram, SEO, Google Meu Negócio</p>
        </div>
        <button
          onClick={() => {
            setEditingOrganico(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Novo Lead
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-3 text-left font-semibold">Identificação</th>
              <th className="px-4 py-3 text-right font-semibold bg-yellow-50 dark:bg-yellow-900/10">Leads</th>
              <th className="px-4 py-3 text-right font-semibold bg-yellow-50 dark:bg-yellow-900/10">Atendimentos</th>
              <th className="px-4 py-3 text-right font-semibold bg-yellow-50 dark:bg-yellow-900/10">Contratos</th>
              <th className="px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/10">Fat. Potencial</th>
              <th className="px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/10">Fat. Previsto</th>
              <th className="px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/10">Lucro Previsto</th>
              <th className="px-4 py-3 text-center font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {organicos.map((org) => {
              const config = PRODUTOS_CONFIG[org.produto as keyof typeof PRODUTOS_CONFIG] || { honorario: 0, prob: 0.65 };
              const fatPot = org.contratos * config.honorario;
              const fatPrev = fatPot * config.prob;
              const lucro = fatPrev * (1 - 0.22);

              return (
                <tr key={org.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-white">{org.canalOrganico}</div>
                    <div className="text-xs text-slate-500">{org.mes} • {org.produto}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{org.origemEspecifica}</div>
                  </td>
                  <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10 text-slate-900 dark:text-white">{org.leads}</td>
                  <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10 text-slate-900 dark:text-white">{org.atendimentos}</td>
                  <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10 text-slate-900 dark:text-white">{org.contratos}</td>
                  <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium text-slate-900 dark:text-white">
                    R$ {fatPot.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium text-green-600">
                    R$ {fatPrev.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium text-green-600">
                    R$ {lucro.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingOrganico(org);
                        setOpenModal(true);
                      }}
                      className="inline text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ open: true, id: org.id })}
                      className="inline text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(org.id)}
                      className="inline text-green-600 hover:text-green-700"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AdicionarOrganicoModal
        open={openModal}
        onOpenChange={(open) => {
          setOpenModal(open);
          if (!open) setEditingOrganico(null);
        }}
        onSave={handleSave}
        editingOrganico={editingOrganico}
        produtos={Object.keys(PRODUTOS_CONFIG)}
        honorariosMedio={Object.fromEntries(
          Object.entries(PRODUTOS_CONFIG).map(([k, v]) => [k, v.honorario])
        )}
        probRecebimentos={Object.fromEntries(
          Object.entries(PRODUTOS_CONFIG).map(([k, v]) => [k, v.prob])
        )}
      />

      <ConfirmacaoDeleteDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Deletar Lead Orgânico?"
        description="Esta ação não pode ser desfeita."
        onConfirm={() => {
          handleDelete(deleteConfirm.id);
          setDeleteConfirm({ open: false, id: "" });
        }}
      />

      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          💡 Campos amarelos = entrada manual · Campos azuis = cálculos automáticos
        </p>
      </div>
    </div>
  );
}
