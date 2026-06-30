'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Roteiro {
  id: string;
  nome: string;
  descricao: string;
  regras: string[];
  isAtivo: boolean;
}

interface Especialista {
  id: string;
  nome: string;
  expertise: string;
  descricao: string;
  perguntasChave: string[];
  isAtivo: boolean;
}

export default function ConfigIA() {
  const [tab, setTab] = useState<'roteiros' | 'especialistas'>('roteiros');
  
  const [roteiros] = useState<Roteiro[]>([
    {
      id: '1',
      nome: 'Roteiro de Recepção',
      descricao: 'Recepção inicial com Marta',
      regras: [
        'NUNCA comece frase com "Entendi", "Certo", "Ok"',
        'NUNCA use o nome do lead mais de 2x',
        'NUNCA diga que é IA/robô',
        'Siga rigorosamente a ordem do roteiro'
      ],
      isAtivo: true
    }
  ]);

  const [especialistas] = useState<Especialista[]>([
    {
      id: '1',
      nome: 'Ana - Especialista INSS',
      expertise: 'Aposentadoria',
      descricao: 'Especializada em aposentadorias',
      perguntasChave: ['Tempo de contribuição?', 'Carteira assinada?'],
      isAtivo: true
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/ia/atendimento" className="text-purple-600 hover:text-purple-800 mb-4 inline-block">
          ← Voltar
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">⚙️ Configuração - Sistema Multi-Agente</h1>
        <p className="text-gray-600 mb-6">Customize roteiros e especialistas de IA</p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab('roteiros')}
            className={`px-6 py-3 rounded-lg font-semibold ${
              tab === 'roteiros'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            📋 Roteiros ({roteiros.length})
          </button>
          <button
            onClick={() => setTab('especialistas')}
            className={`px-6 py-3 rounded-lg font-semibold ${
              tab === 'especialistas'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            👥 Especialistas ({especialistas.length})
          </button>
        </div>

        {tab === 'roteiros' && (
          <div className="bg-white rounded-lg p-6 shadow">
            {roteiros.map(r => (
              <div key={r.id} className="mb-4 pb-4 border-b">
                <h3 className="font-bold text-lg">{r.nome}</h3>
                <p className="text-gray-600">{r.descricao}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'especialistas' && (
          <div className="grid md:grid-cols-2 gap-4">
            {especialistas.map(e => (
              <div key={e.id} className="bg-white rounded-lg p-6 shadow">
                <h3 className="font-bold text-lg">{e.nome}</h3>
                <p className="text-purple-600 text-sm">{e.expertise}</p>
                <p className="text-gray-600">{e.descricao}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
