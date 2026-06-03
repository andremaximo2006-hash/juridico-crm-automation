import { z } from "zod";

export const LeadCreateSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  phone: z.string().min(8, "Telefone inválido"),
  cpf: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
  profession: z.string().optional().nullable(),
  estimatedIncome: z.number().optional().nullable(),
  originChannel: z.enum(["instagram", "google", "referral", "direct", "other"]).optional().nullable(),
  legalArea: z.enum(["familia", "trabalhista", "civil", "criminal", "consumidor", "inventario", "previdenciario", "other"]).optional().nullable(),
  caseSummary: z.string().optional().nullable(),
});

export const ClienteCreateSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  phone: z.string().min(8, "Telefone inválido"),
  email: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
  profession: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
});

export const ClientePatchSchema = z.object({
  name: z.string().min(2).optional(),
  cpf: z.string().min(11).max(14).optional(),
  phone: z.string().min(8).optional(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  profession: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).partial();

export const TransactionCreateSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.enum([
    "pro_labore_entry",
    "monthly_retainer",
    "success_fee",
    "office_rent",
    "software",
    "marketing",
    "personnel",
    "utilities",
    "other_income",
    "other_expense",
  ]),
  description: z.string().optional().nullable(),
  amount: z.number().positive("Valor deve ser positivo"),
  dueDate: z.string().min(1, "Data obrigatória"),
  status: z.enum(["pending", "paid", "overdue"]).optional(),
  clientId: z.string().optional().nullable(),
  caseId: z.string().optional().nullable(),
});

export type LeadCreate = z.infer<typeof LeadCreateSchema>;
export type ClienteCreate = z.infer<typeof ClienteCreateSchema>;
export type ClientePatch = z.infer<typeof ClientePatchSchema>;
export type TransactionCreate = z.infer<typeof TransactionCreateSchema>;
