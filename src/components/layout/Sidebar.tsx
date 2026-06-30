"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Settings, Scale, LogOut, Sun, Moon, Menu, X, Calendar, Bot, TrendingUp, ChevronDown, BarChart3, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { hasMenuAccess } from "@/lib/menu-access";

interface NavItem {
  href?: string;
  icon: any;
  label: string;
  menuId?: string; // ID único do menu para controle de acesso
  roles?: string[]; // Mantido para compatibilidade
  submenu?: NavItem[];
}

const ALL_NAV_ITEMS: NavItem[] = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard", menuId: "dashboard", roles: ["admin", "financeiro", "padrao"] },
  {
    icon: Users,
    label: "Leads",
    menuId: "leads",
    roles: ["admin", "padrao"],
    submenu: [
      { href: "/leads", icon: TrendingUp, label: "Funil de Leads", menuId: "leads", roles: ["admin", "padrao"] },
      { href: "/leads/configuracoes", icon: Settings, label: "Configurações", menuId: "leads-config", roles: ["admin"] },
    ]
  },
  {
    icon: Bot,
    label: "IA Atendimento",
    menuId: "ia-atendimento",
    roles: ["admin", "padrao"],
    submenu: [
      { href: "/ia/hub", icon: Rocket, label: "🚀 IA Hub", menuId: "ia-hub", roles: ["admin", "padrao"] },
      { href: "/ia/atendimento", icon: Bot, label: "Atendimento", menuId: "ia-atendimento", roles: ["admin", "padrao"] },
      { href: "/ia/roteiros", icon: Settings, label: "Roteiros", menuId: "ia-roteiros", roles: ["admin"] },
      { href: "/ia/conversas", icon: Users, label: "Conversas", menuId: "ia-conversas", roles: ["admin"] },
      { href: "/ia/atendimento-humano", icon: Users, label: "Atendimento Humano", menuId: "ia-atendimento-humano", roles: ["admin"] },
    ]
  },
  // Menus desativados - migrados para dashboard_operacional
  // { href: "/clientes", icon: UserCheck, label: "Clientes", menuId: "clientes", roles: ["admin", "padrao"] },
  // { icon: ClipboardList, label: "Operacional", menuId: "operacional", roles: ["admin", "padrao"], submenu: [...] },
  // { href: "/financeiro", icon: DollarSign, label: "Financeiro", menuId: "financeiro", roles: ["admin", "financeiro"] },
  {
    icon: TrendingUp,
    label: "Gerencial",
    menuId: "gerencial",
    roles: ["admin"],
    submenu: [
      { href: "/gerencial", icon: TrendingUp, label: "📊 Dashboard", menuId: "gerencial", roles: ["admin"] },
      { href: "/gerencial/previsibilidade", icon: TrendingUp, label: "🔮 Previsibilidade", menuId: "previsibilidade", roles: ["admin"] },
    ]
  },
  { href: "/agenda", icon: Calendar, label: "Agenda", menuId: "agenda", roles: ["admin", "padrao"] },
  { href: "/marketing", icon: BarChart3, label: "Marketing", menuId: "marketing", roles: ["admin"] },
  { href: "/configuracoes", icon: Settings, label: "Configurações", menuId: "configuracoes", roles: ["admin"] },
];

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  financeiro: "Financeiro",
  padrao: "Padrão",
};

interface SidebarProps {
  userRole: string;
  userName: string;
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("crm-theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Auto-expandir menus que têm um item ativo
  useEffect(() => {
    const itemsToExpand = ALL_NAV_ITEMS
      .filter(item => item.submenu && item.submenu.some(sub => isActive(sub.href)))
      .map(item => item.label);

    if (itemsToExpand.length > 0) {
      setExpandedMenus(prev => {
        const newExpanded = new Set([...prev, ...itemsToExpand]);
        return Array.from(newExpanded);
      });
    }
  }, [pathname]);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("crm-theme", next ? "dark" : "light");
  }

  // Filtrar menus baseado em role usando hasMenuAccess
  const navItems = ALL_NAV_ITEMS.filter((item) => {
    const menuId = item.menuId || item.label?.toLowerCase().replace(/\s+/g, "-");
    return hasMenuAccess(userRole as any, menuId);
  }).map((item) => {
    // Filtrar submenus também se necessário
    if (item.submenu) {
      const filteredSubmenu = item.submenu.filter((subitem) => {
        const subMenuId = subitem.menuId || subitem.label?.toLowerCase().replace(/\s+/g, "-");
        return subitem.roles ? subitem.roles.includes(userRole) : true;
      });
      return { ...item, submenu: filteredSubmenu };
    }
    return item;
  });

  function toggleSubmenu(label: string) {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(m => m !== label)
        : [...prev, label]
    );
  }

  function isActive(href?: string): boolean {
    if (!href) return false;
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  function isSubmenuActive(items?: NavItem[]): boolean {
    if (!items) return false;
    return items.some(item => isActive(item.href));
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const sidebarContent = (
    <aside className="w-56 min-h-screen bg-slate-900 text-white flex flex-col shrink-0">
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-sm tracking-wide">CRM Jurídico</span>
        </div>
        <button onClick={toggleDark} title="Alternar tema" className="text-slate-400 hover:text-white transition-colors">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedMenus.includes(item.label);
          const activeMain = hasSubmenu ? isSubmenuActive(item.submenu) : isActive(item.href);

          if (hasSubmenu) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    activeMain || isExpanded
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </div>
                  <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform", isExpanded && "rotate-180")} />
                </button>
                {isExpanded && item.submenu && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-3">
                    {item.submenu?.map((subitem) => {
                      const subActive = isActive(subitem.href);
                      return (
                        <Link
                          key={subitem.href}
                          href={subitem.href || "#"}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            subActive
                              ? "bg-blue-600 text-white"
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          )}
                        >
                          <subitem.icon className="w-4 h-4 shrink-0" />
                          {subitem.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href || "#"}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                activeMain
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-700 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-slate-400">{ROLE_LABELS[userRole] ?? userRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex">{sidebarContent}</div>

      {/* Mobile — botão hambúrguer */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 text-white flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-sm">CRM Jurídico</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleDark} className="text-slate-400 hover:text-white">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-400 hover:text-white">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile — drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div className="flex">{sidebarContent}</div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Espaço para a topbar mobile */}
      <div className="lg:hidden h-14 shrink-0" />
    </>
  );
}
