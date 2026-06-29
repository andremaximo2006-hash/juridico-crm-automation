"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface SMSCampanha {
  id: string;
  nome: string;
  status: string;
  totalDestina: number;
  enviados: number;
  entregues: number;
}

export default function SMSCampanhasPage() {
  const [campanhas, setCampanhas] = useState<SMSCampanha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sms/campanhas")
      .then(r => r.json())
      .then(data => {
        setCampanhas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Campanhas SMS</h1>
        <Link href="/ia/sms/nova-campanha" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          + Nova Campanha
        </Link>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : campanhas.length === 0 ? (
        <p className="text-gray-500">Nenhuma campanha criada</p>
      ) : (
        <div className="grid gap-4">
          {campanhas.map(c => (
            <div key={c.id} className="border rounded-lg p-4 bg-white hover:shadow-lg">
              <h3 className="font-semibold text-lg">{c.nome}</h3>
              <div className="grid grid-cols-4 gap-4 text-sm mt-4">
                <div>
                  <p className="text-gray-600">Destinatários</p>
                  <p className="font-semibold">{c.totalDestina}</p>
                </div>
                <div>
                  <p className="text-gray-600">Enviados</p>
                  <p className="font-semibold text-green-600">{c.enviados}</p>
                </div>
                <div>
                  <p className="text-gray-600">Entregues</p>
                  <p className="font-semibold text-blue-600">{c.entregues}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold">{c.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
