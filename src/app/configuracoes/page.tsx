"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { UsersTab } from "@/components/configuracoes/UsersTab";
import { Settings, Save, X } from "lucide-react";

export default function ConfiguracoesPage() {
  const [tab, setTab] = useState("perfil");
  const [perfil, setPerfil] = useState({
    nome: "Gabriel Nunes",
    email: "gabriel@example.com",
    telefone: "",
  });

  const [notificacoes, setNotificacoes] = useState({
    emailCasos: true,
    alertaPrazos: true,
    reunioes: true,
    newsletter: false,
  });

  const handleSalvar = () => {
    console.log("Perfil salvo:", perfil);
  };

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Configurações"
        subtitle="Preferências e configurações da conta"
      />

      {/* Abas */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="flex gap-4 px-4">
          {[
            { id: "perfil", label: "👤 Perfil" },
            { id: "notificacoes", label: "🔔 Notificações" },
            { id: "integracao", label: "🔗 Integrações" },
            { id: "seguranca", label: "🔐 Segurança" },
            { id: "usuarios", label: "👥 Usuários" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`border-b-2 px-4 py-3 font-medium transition ${
                tab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-auto bg-slate-50 p-4 dark:bg-slate-800">
        <div className="max-w-2xl">
          {tab === "perfil" && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <h3 className="mb-4 text-lg font-semibold">Dados do Perfil</h3>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={perfil.nome}
                    onChange={(e) =>
                      setPerfil({ ...perfil, nome: e.target.value })
                    }
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={perfil.email}
                    onChange={(e) =>
                      setPerfil({ ...perfil, email: e.target.value })
                    }
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={perfil.telefone}
                    onChange={(e) =>
                      setPerfil({ ...perfil, telefone: e.target.value })
                    }
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSalvar}
                    className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                  >
                    <Save size={18} /> Salvar
                  </button>
                  <button className="rounded border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300">
                    Alterar Senha
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === "notificacoes" && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <h3 className="mb-4 text-lg font-semibold">
                Preferências de Notificações
              </h3>

              <div className="flex flex-col gap-3">
                {Object.entries({
                  emailCasos: "Email para novos casos",
                  alertaPrazos: "Alertas de prazos",
                  reunioes: "Notificações de reunião",
                  newsletter: "Newsletter",
                }).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 rounded p-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={notificacoes[key as keyof typeof notificacoes]}
                      onChange={(e) =>
                        setNotificacoes({
                          ...notificacoes,
                          [key]: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span className="text-slate-700 dark:text-slate-300">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {tab === "integracao" && (
            <div className="space-y-3">
              {[
                {
                  nome: "Asaas",
                  desc: "Gateway de pagamentos integrado",
                },
                {
                  nome: "Google Calendar",
                  desc: "Sincronizar compromissos com Google Calendar",
                },
              ].map((int) => (
                <div
                  key={int.nome}
                  className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                >
                  <h4 className="font-semibold">{int.nome}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {int.desc}
                  </p>
                  <button className="mt-2 rounded border border-blue-600 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800">
                    Configurar
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "seguranca" && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <h3 className="mb-4 text-lg font-semibold">Segurança</h3>

              <div className="space-y-4">
                <div className="rounded bg-slate-100 p-3 dark:bg-slate-800">
                  <p className="font-medium text-slate-900 dark:text-white">
                    Autenticação de dois fatores
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Aumente a segurança da sua conta
                  </p>
                </div>
                <button className="rounded border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300">
                  Configurar 2FA
                </button>

                <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                  <p className="font-medium text-slate-900 dark:text-white">
                    Sessões Ativas
                  </p>
                  <div className="mt-2 rounded bg-slate-100 p-3 dark:bg-slate-800">
                    <p className="font-medium text-slate-900 dark:text-white">
                      Chrome - Windows
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Última atividade: agora
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "usuarios" && <UsersTab />}
        </div>
      </div>
    </div>
  );
}
