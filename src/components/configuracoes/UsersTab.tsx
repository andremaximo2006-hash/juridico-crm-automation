"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Lock, Shield, Users, AlertCircle } from "lucide-react";
import { CreateUserModal } from "./modals/CreateUserModal";
import { ChangePasswordModal } from "./modals/ChangePasswordModal";
import { ChangePermissionModal } from "./modals/ChangePermissionModal";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "financeiro" | "padrao";
  isActive: boolean;
  createdAt: string;
}

type ModalType = "create" | "password" | "permission" | null;

const ROLE_LABELS = {
  admin: "Administrador",
  financeiro: "Financeiro",
  padrao: "Padrão",
};

const ROLE_COLORS = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  financeiro: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  padrao: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
};

export function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Carregar usuários
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/admin/users");
        if (!response.ok) {
          throw new Error("Erro ao carregar usuários");
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleCreateUser = async (data: { name: string; email: string; role: string; password: string }) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar usuário");
      }

      const result = await response.json();
      setUsers([...users, result.user]);
      setModalType(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar usuário");
    }
  };

  const handleChangePassword = async (data: { password: string }) => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao alterar senha");
      }

      setModalType(null);
      setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar senha");
    }
  };

  const handleChangePermission = async (data: { role: string }) => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao alterar permissão");
      }

      const result = await response.json();
      setUsers(users.map((u) => (u.id === selectedUser.id ? result.user : u)));
      setModalType(null);
      setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar permissão");
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm("Tem certeza que deseja desativar este usuário?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });

      if (!response.ok) {
        throw new Error("Erro ao desativar usuário");
      }

      setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: false } : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao desativar usuário");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-slate-600 dark:text-slate-400">Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20 flex gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Botão Criar Novo */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setModalType("create");
            setSelectedUser(null);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Novo Usuário
        </button>
      </div>

      {/* Tabela de Usuários */}
      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Nome</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Permissão</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[user.role]}`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${user.isActive ? "text-green-600" : "text-red-600"}`}>
                      {user.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setModalType("permission");
                        }}
                        title="Alterar permissão"
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Shield className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setModalType("password");
                        }}
                        title="Alterar senha"
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Lock className="h-3.5 w-3.5" />
                      </button>
                      {user.isActive && (
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          title="Desativar"
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="flex items-center justify-center py-8 text-slate-600 dark:text-slate-400">
            <div className="text-center">
              <Users className="mx-auto h-10 w-10 mb-2 opacity-50" />
              <p>Nenhum usuário cadastrado</p>
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      {modalType === "create" && (
        <CreateUserModal
          onClose={() => setModalType(null)}
          onSubmit={handleCreateUser}
        />
      )}

      {modalType === "password" && selectedUser && (
        <ChangePasswordModal
          user={selectedUser}
          onClose={() => {
            setModalType(null);
            setSelectedUser(null);
          }}
          onSubmit={handleChangePassword}
        />
      )}

      {modalType === "permission" && selectedUser && (
        <ChangePermissionModal
          user={selectedUser}
          onClose={() => {
            setModalType(null);
            setSelectedUser(null);
          }}
          onSubmit={handleChangePermission}
        />
      )}
    </div>
  );
}
