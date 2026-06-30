'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, Copy } from 'lucide-react';

export default function MetaSetupPage() {
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const webhookUrl = 'https://crm.gabriellenunes.com.br/api/webhooks/whatsapp/meta';
  const verifyToken = 'webhook_verify_token_2026';

  const handleSave = async () => {
    if (!phoneNumberId.trim() || !accessToken.trim()) {
      setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios' });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'meta',
          phoneNumberId,
          apiKey: accessToken,
          active: true,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Integração Meta salva com sucesso!' });
        setPhoneNumberId('');
        setAccessToken('');
      } else {
        setMessage({ type: 'error', text: '❌ Erro ao salvar integração' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Erro na conexão' });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/ia/whatsapp" className="text-green-600 hover:text-green-800 mb-6 inline-block">
          ← Voltar
        </Link>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">📱 Configurar Meta Business</h1>
        <p className="text-gray-600 mb-8">Integre sua conta WhatsApp Business com Claude IA</p>

        <div className="space-y-6">
          {/* Step 1: Obter Credenciais */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🔑 Passo 1: Obter Credenciais</h2>
            <p className="text-gray-600 mb-4">
              Acesse <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer"
                className="text-green-600 hover:underline">
                Meta Developers
              </a> e obtenha:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
              <li><strong>Phone Number ID:</strong> Identificador do seu número WhatsApp</li>
              <li><strong>Access Token:</strong> Token de acesso da API Cloud</li>
              <li><strong>Webhook URL:</strong> Configure em Meta App Settings</li>
              <li><strong>Verify Token:</strong> Token de verificação do webhook</li>
            </ul>
          </div>

          {/* Step 2: Configurar Webhook */}
          <div className="bg-blue-50 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🔗 Passo 2: Configurar Webhook</h2>
            <p className="text-gray-600 mb-4">Configure em Meta App Dashboard → WhatsApp → Configuration:</p>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">Callback URL</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={webhookUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(webhookUrl)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Copy size={16} />
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Verify Token</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={verifyToken}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(verifyToken)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Copy size={16} />
                    Copiar
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Subscribe Fields</label>
                <input
                  type="text"
                  value="messages,message_template_status_update"
                  readOnly
                  className="w-full px-3 py-2 mt-1 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Colar Credenciais */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Passo 3: Registrar Credenciais</h2>

            {message && (
              <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number ID *
                </label>
                <input
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="Ex: 123456789012345"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Encontre em Meta App Dashboard → WhatsApp → API Setup</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Access Token *
                </label>
                <textarea
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Ex: EAABs..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Token da Cloud API. Mantenha seguro!</p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold transition flex items-center justify-center gap-2"
              >
                {saving ? '⏳ Salvando...' : '✅ Salvar Integração'}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-amber-50 rounded-lg shadow-lg p-6 border-l-4 border-amber-500">
            <h3 className="font-bold text-amber-900 mb-2">ℹ️ Próximos Passos</h3>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>Após salvar, Meta enviará um POST para validar o webhook</li>
              <li>O sistema responderá com o challenge automaticamente</li>
              <li>Teste enviando uma mensagem de teste no Meta Dashboard</li>
              <li>Verifique os logs em <code className="bg-white px-2 py-1 rounded">/ia/whatsapp/logs</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
