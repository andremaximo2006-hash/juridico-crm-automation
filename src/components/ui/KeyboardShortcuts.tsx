"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface KeyboardShortcutsProps {
  onNewItem?: () => void; // Ctrl+N
}

export function KeyboardShortcuts({ onNewItem }: KeyboardShortcutsProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      const tag = (e.target as HTMLElement).tagName;
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(tag);

      // Esc — fecha modais (dispara evento customizado)
      if (e.key === "Escape") {
        document.dispatchEvent(new CustomEvent("crm:close-modal"));
        return;
      }

      if (isInput) return;

      // Ctrl+N — novo item na página atual
      if (ctrl && e.key === "n") {
        e.preventDefault();
        if (onNewItem) {
          onNewItem();
        } else {
          document.dispatchEvent(new CustomEvent("crm:new-item"));
        }
      }

      // Ctrl+K — busca global (foca no primeiro input de busca visível)
      if (ctrl && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="Buscar"], input[placeholder*="buscar"], input[type="search"]'
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // G+D — ir para Dashboard
      // G+L — ir para Leads
      // G+C — ir para Clientes
      // G+F — ir para Financeiro
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onNewItem, pathname, router]);

  return null;
}
