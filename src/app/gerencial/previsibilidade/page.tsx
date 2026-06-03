"use client";

import { Header } from "@/components/layout/Header";
import { PrevisibilidadeApp } from "@/components/previsibilidade/PrevisibilidadeApp";

export default function PrevisibilidadePage() {
  return (
    <div className="flex h-full flex-col">
      <Header
        title="Previsibilidade de Receitas"
        subtitle="Controle de tráfego pago + orgânico · Funil jurídico · Previsibilidade de faturamento"
      />

      <div className="flex-1 overflow-auto">
        <PrevisibilidadeApp />
      </div>
    </div>
  );
}
