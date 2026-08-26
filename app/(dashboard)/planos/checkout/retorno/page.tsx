'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

const ACTIVE_STATUSES = ['trialing', 'active'];
const POLL_ATTEMPTS = 6;
const POLL_INTERVAL_MS = 1500;

export default function CheckoutReturnPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'open'>('loading');

  useEffect(() => {
    if (!sessionId) {
      router.push('/planos');
      return;
    }

    let cancelled = false;

    const checkStatus = async () => {
      // O webhook do Stripe atualiza a assinatura no backend de forma assíncrona,
      // então tentamos algumas vezes antes de considerar como pendente.
      for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
        try {
          const response = await api.get<any>('/billing/trial/status');
          const subscriptionStatus = response?.subscriptionStatus || response?.data?.subscriptionStatus;
          if (ACTIVE_STATUSES.includes(subscriptionStatus)) {
            if (!cancelled) setStatus('success');
            return;
          }
        } catch (err) {
          console.error('Erro ao verificar status da assinatura:', err);
        }
        if (!cancelled) await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
      if (!cancelled) setStatus('open');
    };

    checkStatus();
    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  return (
    <div className="mx-auto max-w-2xl pt-16 pb-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verificando pagamento...</h2>
            <p className="text-slate-500 dark:text-slate-400">Por favor, aguarde enquanto confirmamos sua assinatura.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Assinatura Ativada!</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Seu período de teste de 7 dias grátis foi iniciado com sucesso. Você já tem acesso a todos os recursos.
            </p>
            <div className="pt-6">
              <Link
                href="/dashboard"
                className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Acessar o Sistema
              </Link>
            </div>
          </div>
        )}

        {status === 'open' && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pagamento Pendente</h2>
            <p className="text-slate-500 dark:text-slate-400">
              A assinatura não foi concluída. Se o erro persistir, entre em contato com o suporte.
            </p>
            <div className="pt-6">
              <Link
                href="/planos"
                className="rounded-lg border border-slate-300 bg-white px-8 py-3 font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Voltar aos Planos
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
