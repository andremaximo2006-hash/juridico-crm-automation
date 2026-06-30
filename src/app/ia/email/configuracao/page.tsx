'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

const emailConfigSchema = z.object({
  provider: z.enum(['smtp', 'sendgrid']),
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  sendgridApiKey: z.string().optional(),
  fromEmail: z.string().email('Email inválido'),
  fromName: z.string().min(1, 'Nome obrigatório'),
  webhookUrl: z.string().url('URL inválida').optional(),
});

type EmailConfigForm = z.infer<typeof emailConfigSchema>;

export default function ConfiguracaoEmail() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [provider, setProvider] = useState<'smtp' | 'sendgrid'>('smtp');
  const [testResult, setTestResult] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<EmailConfigForm>({
    resolver: zodResolver(emailConfigSchema),
    defaultValues: {
      provider: 'smtp',
      fromEmail: 'noreply@juridico.com',
      fromName: 'Jurídico CRM',
    },
  });

  const watchProvider = watch('provider');

  useEffect(() => {
    setProvider(watchProvider);
    // Carregar configuração existente
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/email/config');
      if (res.ok) {
        const data = await res.json();
        reset({
          provider: data.provider || 'smtp',
          smtpHost: data.smtpHost,
          smtpPort: data.smtpPort,
          smtpUser: data.smtpUser,
          fromEmail: data.fromEmail,
          fromName: data.fromName,
          webhookUrl: data.webhookUrl,
        });
        setProvider(data.provider || 'smtp');
      }
    } catch (err) {
      console.error('Erro ao carregar configuração:', err);
    }
  };

  const onSubmit = async (data: EmailConfigForm) => {
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch('/api/email/config', {
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

  const testConnection = async () => {
    setLoading(true);
    setTestResult('Testando conexão...');

    try {
      const res = await fetch('/api/email/config/test', {
        method: 'POST',
      });

      if (res.ok) {
        setTestResult('✅ Conexão bem-sucedida!');
      } else {
        const err = await res.json();
        setTestResult(`❌ Erro: ${err.message}`);
      }
    } catch (err) {
      setTestResult('❌ Erro ao testar conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/ia/email" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Voltar
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">⚙️ Configuração de Email</h1>
          <p className="text-gray-600">Configure SMTP ou SendGrid para enviar emails</p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                📧 Provedor de Email
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="smtp"
                    {...register('provider')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">SMTP (Gmail, Outlook, etc)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="sendgrid"
                    {...register('provider')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">SendGrid API</span>
                </label>
              </div>
            </div>

            {/* SMTP Configuration */}
            {provider === 'smtp' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-bold text-gray-800 mb-4">Configuração SMTP</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Host SMTP
                    </label>
                    <input
                      type="text"
                      placeholder="smtp.gmail.com"
                      {...register('smtpHost')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.smtpHost && (
                      <p className="text-red-500 text-sm mt-1">{errors.smtpHost.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Porta
                    </label>
                    <input
                      type="text"
                      placeholder="587"
                      {...register('smtpPort')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email (Usuário)
                  </label>
                  <input
                    type="email"
                    placeholder="seu-email@gmail.com"
                    {...register('smtpUser')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Senha / App Password
                  </label>
                  <input
                    type="password"
                    placeholder="Sua app password do Gmail"
                    {...register('smtpPassword')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Para Gmail: Ative autenticação em 2 etapas e gere uma app password em
                    myaccount.google.com/app-passwords
                  </p>
                </div>
              </div>
            )}

            {/* SendGrid Configuration */}
            {provider === 'sendgrid' && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-bold text-gray-800 mb-4">Configuração SendGrid</h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    API Key SendGrid
                  </label>
                  <input
                    type="password"
                    placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxx"
                    {...register('sendgridApiKey')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Obtenha em sendgrid.com → Settings → API Keys
                  </p>
                </div>
              </div>
            )}

            {/* From Email & Name */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-4">Remetente</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Remetente
                  </label>
                  <input
                    type="email"
                    {...register('fromEmail')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.fromEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.fromEmail.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome Remetente
                  </label>
                  <input
                    type="text"
                    {...register('fromName')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.fromName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fromName.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Webhook URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔗 Webhook URL (para rastreamento)
              </label>
              <input
                type="url"
                placeholder="https://seu-servidor.com/webhooks/email"
                {...register('webhookUrl')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Opcional: Configure para receber notificações de abertos e cliques
              </p>
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
            {testResult && (
              <div
                className={`p-4 rounded-lg ${
                  testResult.includes('✅')
                    ? 'bg-green-100 border border-green-400 text-green-700'
                    : 'bg-yellow-100 border border-yellow-400 text-yellow-700'
                }`}
              >
                {testResult}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? 'Salvando...' : '💾 Salvar Configuração'}
              </button>

              <button
                type="button"
                onClick={testConnection}
                disabled={loading}
                className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {loading ? 'Testando...' : '🧪 Testar Conexão'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-800 mb-3">📚 Guia de Configuração</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>
              <strong>SMTP (Gmail):</strong> Use sua senha de app de 16 caracteres, não a senha
              da conta
            </li>
            <li>
              <strong>SendGrid:</strong> Crie uma API key em sendgrid.com com permissão de envio
            </li>
            <li>
              <strong>Webhook:</strong> Opcional, para rastrear abertos e cliques nos emails
            </li>
            <li>
              <strong>Teste:</strong> Sempre teste a conexão antes de usar em campanhas
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
