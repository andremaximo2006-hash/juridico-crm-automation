import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function DefaultIllustration() {
  return (
    <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="20" y="15" width="80" height="60" rx="6" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
      <rect x="30" y="28" width="40" height="5" rx="2.5" fill="#CBD5E1" />
      <rect x="30" y="38" width="60" height="4" rx="2" fill="#E2E8F0" />
      <rect x="30" y="47" width="50" height="4" rx="2" fill="#E2E8F0" />
      <rect x="30" y="56" width="35" height="4" rx="2" fill="#E2E8F0" />
      <circle cx="90" cy="20" r="12" fill="#DBEAFE" stroke="#BFDBFE" strokeWidth="1.5" />
      <path d="M85 20h10M90 15v10" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 opacity-80">
        {icon ?? <DefaultIllustration />}
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 max-w-xs mb-5">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Variante search — para quando nenhum resultado bate com o filtro
function SearchIllustration() {
  return (
    <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="52" cy="42" r="22" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
      <circle cx="52" cy="42" r="14" fill="#E2E8F0" />
      <path d="M68 58l14 14" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
      <path d="M46 42h12M52 36v12" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EmptySearch({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 opacity-80">
        <SearchIllustration />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">Nenhum resultado para &ldquo;{query}&rdquo;</h3>
      <p className="text-sm text-gray-400 max-w-xs mb-5">
        Tente termos diferentes ou remova os filtros ativos.
      </p>
      <button
        onClick={onClear}
        className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
      >
        Limpar busca
      </button>
    </div>
  );
}

// Componente de paginação reutilizável
interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPage: (page: number) => void;
}

export function Pagination({ page, total, limit, onPage }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-2 py-3 text-sm text-gray-500">
      <span>
        {from}–{to} de {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >
          Anterior
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let p: number;
          if (totalPages <= 5) {
            p = i + 1;
          } else if (page <= 3) {
            p = i + 1;
          } else if (page >= totalPages - 2) {
            p = totalPages - 4 + i;
          } else {
            p = page - 2 + i;
          }
          return (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-medium ${
                p === page
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 hover:bg-gray-50 text-gray-600"
              }`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
