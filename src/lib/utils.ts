import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: { toString(): string } | number | string | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value?.toString() ?? 0));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
}

export function formatCPF(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export const FUNNEL_STAGES = {
  new_lead: { label: "Novo Lead", color: "bg-slate-100 text-slate-700" },
  initial_screening: { label: "Triagem Inicial", color: "bg-blue-100 text-blue-700" },
  meeting: { label: "Reunião/Consulta", color: "bg-yellow-100 text-yellow-700" },
  proposal_sent: { label: "Proposta Enviada", color: "bg-orange-100 text-orange-700" },
  contract_signed: { label: "Contrato Assinado", color: "bg-green-100 text-green-700" },
  migrated_to_astrea: { label: "Migrado Astrea", color: "bg-purple-100 text-purple-700" },
  lost: { label: "Perdido", color: "bg-red-100 text-red-700" },
} as const;

export const LEGAL_AREAS = {
  familia: "Direito de Família",
  trabalhista: "Trabalhista",
  civil: "Cível",
  criminal: "Criminal",
  consumidor: "Consumidor",
  inventario: "Inventário",
  previdenciario: "Previdenciário",
  other: "Outro",
} as const;

export const ORIGIN_CHANNELS = {
  instagram: "Instagram",
  google: "Google",
  referral: "Indicação",
  direct: "Direto",
  other: "Outro",
} as const;

export const TRANSACTION_STATUS = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
  paid: { label: "Pago", color: "bg-green-100 text-green-700" },
  overdue: { label: "Atrasado", color: "bg-red-100 text-red-700" },
  installment: { label: "Parcelado", color: "bg-blue-100 text-blue-700" },
} as const;

export const TRANSACTION_CATEGORIES = {
  pro_labore_entry: "Honorários Pro Labore",
  monthly_retainer: "Mensalidade",
  success_fee: "Honorários de Êxito",
  office_rent: "Aluguel Escritório",
  software: "Software/Assinatura",
  marketing: "Marketing/Anúncios",
  personnel: "Pessoal",
  utilities: "Utilities",
  other_income: "Outra Receita",
  other_expense: "Outra Despesa",
} as const;
