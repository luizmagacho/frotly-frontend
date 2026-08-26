'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { api } from '@/lib/api-client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Usar chave pública (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
// apiVersion fixado em 2026-03-25.dahlia: a conta ainda está numa versão de API
// anterior a essa, que não suporta ui_mode: 'embedded_page' (ver billing.service.ts).
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51HQFk3AV2SviZXwdSYf6kAsxtY1msfV90CSO3HHvR9lh1bDvSEiQOxUuhFoVf78ncwe8LW7O127JgNvRpHWooGyh00a6isnU8L',
  { apiVersion: '2026-03-25.dahlia' }
);

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const plan = searchParams.get('plan');
  const interval = searchParams.get('interval') || 'monthly';
  
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!plan) {
      router.push('/planos');
      return;
    }

    const fetchClientSecret = async () => {
      try {
        const response = await api.post<any>('/billing/checkout', {
          plan,
          interval,
        });
        
        // Agora o backend retorna clientSecret em vez de url
        if (response?.clientSecret || response?.data?.clientSecret) {
          setClientSecret(response.clientSecret || response.data.clientSecret);
        } else {
          setError('Erro ao carregar sessão de pagamento segura.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Falha de comunicação com o servidor de pagamentos.');
      }
    };

    fetchClientSecret();
  }, [plan, interval, router]);

  const intervalLabel = interval === 'annual' ? 'Anual' : 'Mensal';
  const planLabel = plan === 'BASIC' ? 'Básico' : plan === 'PRO' ? 'Profissional' : 'Empresarial';

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/planos" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assinar Plano {planLabel}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ciclo de faturamento: {intervalLabel}. <strong className="text-emerald-600 dark:text-emerald-400">Teste grátis de 7 dias</strong> incluso!
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 min-h-[500px]">
        {error ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="text-red-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Erro no Pagamento</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error}</p>
            <button 
              onClick={() => router.push('/planos')}
              className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Voltar aos Planos
            </button>
          </div>
        ) : !clientSecret ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Carregando ambiente seguro de pagamento...</p>
          </div>
        ) : (
          <div id="checkout">
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </div>
    </div>
  );
}
