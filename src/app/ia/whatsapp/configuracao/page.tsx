'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

const whatsappConfigSchema = z.object({
  webhookToken: z.string().min(1, 'Token obrigatório'),
  webhookSignature: z.string().min(1, 'Assinatura obrigatória'),
  businessPhoneId: z.string().min(1, 'Phone ID obrigatório'),
  accessToken: z.string().min(1, 'Access Token obrigatório'),
  webhookUrl: z.string().url('URL inválida'),
});

type WhatsappConfigForm = z.infer<typeof whatsappConfigSchema>;

export default function ConfiguracaoWhatsApp() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WhatsappConfigForm>({
    resolver: zodResolver(whatsappConfigSchema),
    defaultValues: {
      webhookUrl: 'https://crm.gabriellenunes.com.br/api/whatsapp/webhook',
    },
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/whatsapp/config');
      if (res.ok) {
        const data = await res.json();
        reset({
          webhookToken: data.webhookToken,
          webhookSignature: data.webhookSignature,
          businessPhoneId: data.businessPhoneId,
          accessToken: data.accessToken,
          webhookUrl: data.webhookUrl || 'https://crm.gabriellenunes.com.br/api/whatsapp/webhook',
        });
      }
    } catch (err) {
      console.error('Erro ao carregar configuração:', err);
    }
  };

  const onSubmit = async (data: WhatsappConfigForm) => {
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess('✅ Configuração salva com sucesso!');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const err = await res.json();
        setError(err.message || 'Erro ao salvar configuração');
      }
    } catch (err) {
      setError('Erro ao conectar com servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/ia/whatsapp"
            className="text-green-600 hover:text-green-800 mb-4 inline-block"
          >
            ← Voltar
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">⚙️ Configuração WhatsApp</h1>
          <p className="text-gray-600">Configure Meta Business para receber mensagens WhatsApp</p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Meta Credentials */}
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-bold text-gray-800 mb-4">🔐 Credenciais Meta</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Phone ID
                </label>
                <input
                  type="text"
                  placeholder="123456789012345"
                  {...register('businessPhoneId')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
                {errors.businessPhoneId && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessPhoneId.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  💡 Obtém em Meta Business → WhatsApp → Configurações → Números de telefone
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Access Token (Permanente)
                </label>
                <input
                  type="password"
                  placeholder="EAABs..."
                  {...register('accessToken')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
                {errors.accessToken && (
                  <p className="text-red-500 text-sm mt-1">{errors.accessToken.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  💡 Gere em Meta Business → Apps → Seu App → Configurações → API Access Token
                </p>
              </div>
            </div>

            {/* Webhook Configuration */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold text-gray-800 mb-4">🔗 Webhook</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL do Webhook (Callback)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    {...register('webhookUrl')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        'https://crm.gabriellenunes.com.br/api/whatsapp/webhook',
                        'URL'
                      )
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {copied === 'URL' ? '✓' : '📋'}
                  </button>
                </div>
                {errors.webhookUrl && (
                  <p className="text-red-500 text-sm mt-1">{errors.webhookUrl.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Webhook Verify Token
                </label>
                <input
                  type="text"
                  placeholder="seu_token_secreto_aqui"
                  {...register('webhookToken')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                {errors.webhookToken && (
                  <p className="text-red-500 text-sm mt-1">{errors.webhookToken.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  💡 Crie um token seguro (mínimo 16 caracteres, use números + letras)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Webhook Signature (Secret)
                </label>
                <input
                  type="password"
                  placeholder="sua_chave_secreta"
                  {...register('webhookSignature')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                {errors.webhookSignature && (
                  <p className="text-red-500 text-sm mt-1">{errors.webhookSignature.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  💡 Utilize a mesma chave que será usada no painel Meta
                </p>
              </div>
            </div>

            {/* Alerts */}
            {success && (
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {success}
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {loading ? 'Salvando...' : '💾 Salvar Configuração'}
              </button>
            </div>
          </form>
        </div>

        {/* Setup Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📋 Passo a Passo: Meta Business Setup</h3>
          <ol className="text-sm text-gray-700 space-y-3 list-decimal list-inside">
            <li>
              Acesse{' '}
              <a
                href="https://business.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Meta Business Manager
              </a>
            </li>
            <li>Vá para Apps → Seu App (crie se não tiver)</li>
            <li>Configure WhatsApp → Configurações → Números de Telefone</li>
            <li>Copie o Business Phone ID para o campo acima</li>
            <li>Gere um Access Token permanente em API Access Token</li>
            <li>Configure o Webhook:
              <ul className="ml-6 mt-2 space-y-1">
                <li>URL do Callback: copie do campo acima</li>
                <li>Verify Token: insira um token seguro</li>
                <li>Webhook Signature: insira a chave secreta</li>
              </ul>
            </li>
            <li>Selecione os eventos: messages, message_status, message_template_* </li>
            <li>Clique em Salvar Configuração aqui</li>
            <li>Volte ao Meta Business e confirme a URL do webhook</li>
          </ol>
        </div>

        {/* Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-800 mb-3">✅ Seu Webhook Está Pronto</h3>
          <p className="text-sm text-gray-700 mb-3">
            Após configurar no Meta Business, este sistema receberá automaticamente:
          </p>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>✓ Mensagens de entrada</li>
            <li>✓ Status de entrega</li>
            <li>✓ Confirmação de leitura</li>
            <li>✓ Webhooks de interação</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
