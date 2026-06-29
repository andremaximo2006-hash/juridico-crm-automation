"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface SMSTemplate {
  id: string;
  nome: string;
  conteudo: string;
  variaveis: string[];
  isAtivo: boolean;
}

export default function SMSTemplatesPage() {
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sms/templates")
      .then(r => r.json())
      .then(data => {
        setTemplates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Templates SMS</h1>
        <Link href="/ia/sms/novo" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          + Novo
        </Link>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : templates.length === 0 ? (
        <p className="text-gray-500">Nenhum template criado</p>
      ) : (
        <div className="space-y-4">
          {templates.map(t => (
            <div key={t.id} className="border rounded-lg p-4 bg-white">
              <h3 className="font-semibold">{t.nome}</h3>
              <p className="text-sm text-gray-600 mt-2 break-words">{t.conteudo}</p>
              <p className="text-xs text-gray-400 mt-2">{t.conteudo.length} / 160 caracteres</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
