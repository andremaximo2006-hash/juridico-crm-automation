'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

const smsConfigSchema = z.object({
  provider: z.enum(['twilio', 'aws']),
  accountSid: z.string().optional(),
  authToken: z.string().optional(),
  fromNumber: z.string().min(1, 'Número obrigatório'),
  awsAccessKey: z.string().optional(),
  awsSecretKey: z.string().optional(),
  awsRegion: z.string().optional(),
});

type SMSConfigForm = z.infer<typeof smsConfigSchema>;

export default function ConfiguracaoSMS() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [provider, setProvider] = useState<'twilio' | 'aws'>('twilio');
  const [testResult, setTestResult] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SMSConfigForm>({
    resolver: zodResolver(smsConfigSchema),
    defaultValues: {
      provider: 'twilio',
    },
  });

  const watchProvider = watch('provider');

  useEffect(() => {
    setProvider(watchProvider);
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/sms/config');
      if (res.ok) {
        const data = await res.json();
        reset({
          provider: data.provider || 'twilio',
          accountSid: data.accountSid,
          authToken: data.authToken,
          fromNumber: data.fromNumber,
          awsAccessKey: data.awsAccessKey,
          awsRegion: data.awsRegion,
        });
        setProvider(data.provider || 'twilio');
      }
    } catch (err) {
      console.error('Erro ao carregar configuração:', err);
    }
  };

  const onSubmit = async (data: SMSConfigForm) => {
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch('/api/sms/config', {
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
      const res = await fetch('/api/sms/config/test', {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/ia/sms" className="text-purple-600 hover:text-purple-800 mb-4 inline-block">
            ← Voltar
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">⚙️ Configuração de SMS</h1>
          <p className="text-gray-600">Configure Twilio ou AWS SNS para enviar SMS</p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                📱 Provedor de SMS
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="twilio"
                    {...register('provider')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="ml-2 text-gray-700">Twilio</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="aws"
                    {...register('provider')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="ml-2 text-gray-700">AWS SNS</span>
                </label>
              </div>
            </div>

            {/* Twilio Configuration */}
            {provider === 'twilio' && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-bold text-gray-800 mb-4">Configuração Twilio</h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account SID
                  </label>
                  <input
                    type="text"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx"
                    {...register('accountSid')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Encontre em twilio.com → Console → Account SID
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Auth Token
                  </label>
                  <input
                    type="password"
                    placeholder="Seu auth token"
                    {...register('authToken')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Encontre em twilio.com → Console → Auth Token
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número Twilio (De)
                  </label>
                  <input
                    type="text"
                    placeholder="+5585987654321"
                    {...register('fromNumber')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {errors.fromNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.fromNumber.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Seu número Twilio (incluir código país +55)
                  </p>
                </div>
              </div>
            )}

            {/* AWS SNS Configuration */}
            {provider === 'aws' && (
              <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="font-bold text-gray-800 mb-4">Configuração AWS SNS</h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Access Key ID
                  </label>
                  <input
                    type="text"
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    {...register('awsAccessKey')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Secret Access Key
                  </label>
                  <input
                    type="password"
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    {...register('awsSecretKey')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Região AWS
                  </label>
                  <input
                    type="text"
                    placeholder="us-east-1"
                    {...register('awsRegion')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número (De)
                  </label>
                  <input
                    type="text"
                    placeholder="+5585987654321"
                    {...register('fromNumber')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

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
                className="flex-1 bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
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
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-800 mb-3">📚 Guia de Configuração</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>
              <strong>Twilio:</strong> Crie conta em twilio.com e obtenha Account SID e Auth Token
            </li>
            <li>
              <strong>AWS SNS:</strong> Configure IAM user com permissão SNS em aws.amazon.com
            </li>
            <li>
              <strong>Número De:</strong> Deve ser um número verificado no seu provedor
            </li>
            <li>
              <strong>Teste:</strong> Sempre teste antes de usar em campanhas
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
