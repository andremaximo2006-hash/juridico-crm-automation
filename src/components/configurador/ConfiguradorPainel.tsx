'use client';

import React, { useState, useEffect } from 'react';
import { ConfiguradorOperacional, CONFIGURACAO_PADRAO } from '@/types/configurador';
import { ColorPicker } from './ColorPicker';
import { PreviewCard } from './PreviewCard';
import { PresetsPanel } from './PresetsPanel';
import { HistoricoPanel } from './HistoricoPanel';
import { AtalhosPanel } from './AtalhosPanel';
import { ImportExportPanel } from './ImportExportPanel';

export function ConfiguradorPainel() {
  const [config, setConfig] = useState<Partial<ConfiguradorOperacional>>(CONFIGURACAO_PADRAO);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'cores' | 'layout' | 'colunas' | 'filtros' | 'presets' | 'historico' | 'atalhos' | 'import'>('cores');

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/configurador');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/configurador', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setMessage('✅ Configuração salva com sucesso!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await res.json();
        setMessage(`❌ ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMessage('❌ Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(CONFIGURACAO_PADRAO);
    setMessage('🔄 Configuração restaurada para padrão');
  };

  const updateConfig = (field: keyof ConfiguradorOperacional, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 border-b border-gray-200 pb-6 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🎨 Personalizador Visual
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize cores, layout e comportamento do módulo Operacional
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            {(['cores', 'layout', 'colunas', 'filtros', 'presets', 'historico', 'atalhos', 'import'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {tab === 'cores' && '🎨 Cores'}
                {tab === 'layout' && '📐 Layout'}
                {tab === 'colunas' && '📋 Colunas'}
                {tab === 'filtros' && '🔍 Filtros'}
                {tab === 'presets' && '💾 Presets'}
                {tab === 'historico' && '📋 Histórico'}
                {tab === 'atalhos' && '⌨️ Atalhos'}
                {tab === 'import' && '📤 Import/Export'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* ABA: CORES */}
            {activeTab === 'cores' && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Cores das Áreas
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <ColorPicker
                      label="Previdenciário"
                      value={config.corPrevidenciario || '#3B82F6'}
                      onChange={(v) => updateConfig('corPrevidenciario', v)}
                    />
                    <ColorPicker
                      label="Trabalhista"
                      value={config.corTrabalhista || '#10B981'}
                      onChange={(v) => updateConfig('corTrabalhista', v)}
                    />
                    <ColorPicker
                      label="Civil"
                      value={config.corCivil || '#F59E0B'}
                      onChange={(v) => updateConfig('corCivil', v)}
                    />
                    <ColorPicker
                      label="Família"
                      value={config.corFamilia || '#EC4899'}
                      onChange={(v) => updateConfig('corFamilia', v)}
                    />
                    <ColorPicker
                      label="Tributário"
                      value={config.corTributario || '#8B5CF6'}
                      onChange={(v) => updateConfig('corTributario', v)}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Cores das Colunas
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <ColorPicker
                      label="Novo"
                      value={config.corNovoColuna || '#6B7280'}
                      onChange={(v) => updateConfig('corNovoColuna', v)}
                    />
                    <ColorPicker
                      label="Triagem"
                      value={config.corTriagemColuna || '#3B82F6'}
                      onChange={(v) => updateConfig('corTriagemColuna', v)}
                    />
                    <ColorPicker
                      label="Andamento"
                      value={config.corAndamentoColuna || '#F59E0B'}
                      onChange={(v) => updateConfig('corAndamentoColuna', v)}
                    />
                    <ColorPicker
                      label="Concluído"
                      value={config.corConcluidoColuna || '#10B981'}
                      onChange={(v) => updateConfig('corConcluidoColuna', v)}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Cores de Prioridade
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <ColorPicker
                      label="Baixa"
                      value={config.corBaixa || '#10B981'}
                      onChange={(v) => updateConfig('corBaixa', v)}
                    />
                    <ColorPicker
                      label="Normal"
                      value={config.corNormal || '#3B82F6'}
                      onChange={(v) => updateConfig('corNormal', v)}
                    />
                    <ColorPicker
                      label="Alta"
                      value={config.corAlta || '#F59E0B'}
                      onChange={(v) => updateConfig('corAlta', v)}
                    />
                    <ColorPicker
                      label="Urgente"
                      value={config.corUrgente || '#EF4444'}
                      onChange={(v) => updateConfig('corUrgente', v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ABA: LAYOUT */}
            {activeTab === 'layout' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tema
                  </label>
                  <select
                    value={config.tema || 'light'}
                    onChange={(e) => updateConfig('tema', e.target.value as any)}
                    className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="light">☀️ Claro</option>
                    <option value="dark">🌙 Escuro</option>
                    <option value="auto">🔄 Automático</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tamanho do Card
                  </label>
                  <select
                    value={config.tamanhoCard || 'medium'}
                    onChange={(e) => updateConfig('tamanhoCard', e.target.value as any)}
                    className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="small">📱 Pequeno</option>
                    <option value="medium">📋 Médio</option>
                    <option value="large">📄 Grande</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.mostrarAvatar || false}
                      onChange={(e) => updateConfig('mostrarAvatar', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mostrar Avatar do Responsável
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.mostrarProcesso || false}
                      onChange={(e) => updateConfig('mostrarProcesso', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mostrar Número do Processo
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.mostrarDPP || false}
                      onChange={(e) => updateConfig('mostrarDPP', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mostrar DPP (Salário Maternidade)
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.mostrarAlertas || false}
                      onChange={(e) => updateConfig('mostrarAlertas', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mostrar Alertas
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.mostrarObservacoes || false}
                      onChange={(e) => updateConfig('mostrarObservacoes', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mostrar Observações Truncadas
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* ABA: COLUNAS */}
            {activeTab === 'colunas' && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Nomes das Colunas
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Coluna 1
                      </label>
                      <input
                        type="text"
                        value={config.labelNovo || ''}
                        onChange={(e) => updateConfig('labelNovo', e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Coluna 2
                      </label>
                      <input
                        type="text"
                        value={config.labelTriagem || ''}
                        onChange={(e) => updateConfig('labelTriagem', e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Coluna 3
                      </label>
                      <input
                        type="text"
                        value={config.labelAndamento || ''}
                        onChange={(e) => updateConfig('labelAndamento', e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Coluna 4
                      </label>
                      <input
                        type="text"
                        value={config.labelConcluido || ''}
                        onChange={(e) => updateConfig('labelConcluido', e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Visibilidade das Colunas
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={config.colunaNovoVisivel !== false}
                        onChange={(e) => updateConfig('colunaNovoVisivel', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {config.labelNovo || 'Novo'}
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={config.colunaTriagemVisivel !== false}
                        onChange={(e) => updateConfig('colunaTriagemVisivel', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {config.labelTriagem || 'Triagem'}
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={config.colunaAndamentoVisivel !== false}
                        onChange={(e) => updateConfig('colunaAndamentoVisivel', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {config.labelAndamento || 'Andamento'}
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={config.colunaConcluidoVisivel !== false}
                        onChange={(e) => updateConfig('colunaConcluidoVisivel', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {config.labelConcluido || 'Concluído'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: FILTROS */}
            {activeTab === 'filtros' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Registros por Página
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={config.registrosPorPagina || 50}
                    onChange={(e) => updateConfig('registrosPorPagina', parseInt(e.target.value))}
                    className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Auto-refresh Stats (segundos)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={config.autoRefreshStats || 30}
                    onChange={(e) => updateConfig('autoRefreshStats', parseInt(e.target.value))}
                    className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.bloqueioAutomatico !== false}
                      onChange={(e) => updateConfig('bloqueioAutomatico', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ativar Bloqueio Automático
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.notificacoes !== false}
                      onChange={(e) => updateConfig('notificacoes', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ativar Notificações
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.mostrarStatsPorColuna !== false}
                      onChange={(e) => updateConfig('mostrarStatsPorColuna', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mostrar Stats por Coluna
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* ABA: PRESETS */}
            {activeTab === 'presets' && (
              <PresetsPanel
                onLoadPreset={(preset) => {
                  setConfig(preset);
                  setMessage('✅ Preset carregado! Clique em Salvar para aplicar.');
                }}
                onSavePreset={(nome, desc) => {
                  setMessage(`💾 Preset "${nome}" salvo com sucesso!`);
                }}
                presets={[]}
              />
            )}

            {/* ABA: HISTÓRICO */}
            {activeTab === 'historico' && (
              <HistoricoPanel
                historicos={[]}
                loading={false}
              />
            )}

            {/* ABA: ATALHOS */}
            {activeTab === 'atalhos' && (
              <AtalhosPanel
                atalhos={[]}
                onSaveAtalho={(acao, combo) => {
                  setMessage(`⌨️ Atalho para "${acao}" definido como ${combo}`);
                }}
              />
            )}

            {/* ABA: IMPORT/EXPORT */}
            {activeTab === 'import' && (
              <ImportExportPanel
                config={config}
                onExport={() => {
                  setMessage('📥 Configuração exportada! Arquivo será baixado.');
                }}
                onImport={(data) => {
                  setConfig(data);
                  setMessage('📤 Configuração importada com sucesso!');
                }}
              />
            )}
          </div>
        </div>

        {/* Sidebar Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <PreviewCard config={config} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 border-t border-gray-200 pt-6 dark:border-gray-700">
        {message && (
          <div className="rounded bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {saving ? '⏳ Salvando...' : '💾 Salvar Configurações'}
          </button>
          <button
            onClick={handleReset}
            className="rounded border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            🔄 Restaurar Padrão
          </button>
        </div>
      </div>
    </div>
  );
}
