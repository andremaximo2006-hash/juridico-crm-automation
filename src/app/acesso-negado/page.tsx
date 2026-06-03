import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function AcessoNegadoPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 text-center">
      <ShieldOff className="w-12 h-12 text-slate-300 mb-4" />
      <h1 className="text-lg font-semibold text-slate-900 mb-2">Acesso não autorizado</h1>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">
        Você não tem permissão para acessar esta página. Esta área é restrita ao perfil Financeiro ou Administrador.
      </p>
      <Link
        href="/"
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  );
}
