// Menu access configuration - can be used in both client and server components
export type UserRole = "admin" | "financeiro" | "padrao";

export const MENU_ACCESS: Record<UserRole, string[]> = {
  admin: [
    "dashboard",
    "leads",
    "ia-atendimento",
    "clientes",
    "operacional",
    "financeiro",
    "gerencial",
    "agenda",
    "marketing",
    "configuracoes",
  ],
  financeiro: [
    "financeiro",
    "configuracoes",
  ],
  padrao: [
    "leads",
    "ia-atendimento",
    "agenda",
    "clientes",
    "operacional",
  ],
};

export function hasMenuAccess(role: UserRole, menuId: string): boolean {
  const allowedMenus = MENU_ACCESS[role] || [];
  return allowedMenus.includes(menuId);
}
