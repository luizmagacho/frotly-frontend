'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { CheckCircle2, Shield, Zap, Building2, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function PlanosPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    api
      .get<any>('/billing/trial/status')
      .then((res) => setCurrentPlan(res?.plan || res?.data?.plan || null))
      .catch(() => setCurrentPlan(null));
  }, [session]);

  const plans = [
    {
      id: 'BASIC',
      name: 'Starter',
      desc: 'Para locadoras que estão começando',
      monthlyPrice: 149,
      icon: <Shield className="w-6 h-6 text-slate-700 dark:text-slate-300" />,
      features: ['Até 20 veículos', 'Contratos digitais', 'Controle de motoristas', 'Financeiro básico', 'Alertas por e-mail', 'Suporte por chat'],
      highlight: false,
    },
    {
      id: 'PRO',
      name: 'Pro',
      desc: 'Para locadoras em crescimento',
      monthlyPrice: 349,
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      features: ['Até 100 veículos', 'Tudo do Starter', 'Gestão de multas + Detran', 'Alertas via WhatsApp', 'Relatórios avançados', 'IA para análise preditiva', 'API de integração', 'Suporte prioritário'],
      highlight: true,
      badge: 'Mais popular',
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      desc: 'Para grandes frotas e redes',
      monthlyPrice: 649,
      icon: <Building2 className="w-6 h-6 text-emerald-500" />,
      features: ['Veículos ilimitados', 'Tudo do Pro', 'Multi-unidades / Multi-tenant', 'Customizações', 'SLA garantido', 'Gerente de conta dedicado', 'Integração com ERP'],
      highlight: false,
    },
  ];

  const handleSubscribe = async (plan: string) => {
    try {
      setLoadingPlan(plan);
      // Redireciona para a página interna de checkout
      router.push(`/planos/checkout?plan=${plan}&interval=${isAnnual ? 'annual' : 'monthly'}`);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar a assinatura.');
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    try {
      setLoadingPlan('PORTAL');
      const response = await api.get('/billing/portal') as any;
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Erro ao abrir portal:', error);
      alert('Sua locadora ainda não possui uma assinatura ativa no Stripe.');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl pb-24">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">Planos e Assinaturas</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Escolha o plano ideal para gerenciar a sua frota.
        </p>
      </div>

      {/* Toggle Mensal / Anual */}
      <div className="mb-10 flex flex-col items-center justify-center space-y-4">
        <div className="relative inline-flex items-center rounded-full bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setIsAnnual(false)}
            className={`relative z-10 rounded-full px-6 py-2 text-sm font-medium transition-all ${
              !isAnnual ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`relative z-10 flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition-all ${
              isAnnual ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Anual
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              -10%
            </span>
          </button>
        </div>
        {isAnnual && (
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            O plano anual é cobrado em 12 parcelas mensais com 10% de desconto.
          </p>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const price = isAnnual ? plan.monthlyPrice * 0.9 : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border p-8 transition-all duration-300 hover:shadow-xl ${
                plan.highlight
                  ? 'scale-105 border-blue-500/60 bg-gradient-to-b from-blue-50/50 to-white shadow-blue-500/10 dark:from-blue-900/20 dark:to-slate-900'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              {plan.highlight && plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white shadow-lg">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{plan.desc}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
                  {plan.icon}
                </div>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  R$ {price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/mês</span>
              </div>
              
              {isAnnual && (
                <div className="mb-6 text-sm text-slate-500 line-through decoration-red-500/50">
                  De R$ {plan.monthlyPrice.toFixed(2).replace('.', ',')}
                </div>
              )}

              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className={`h-5 w-5 shrink-0 ${plan.highlight ? 'text-blue-500' : 'text-emerald-500'}`} />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loadingPlan === plan.id || isCurrent}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isCurrent
                    ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                    : plan.highlight
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20'
                    : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
                }`}
              >
                {loadingPlan === plan.id ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
                ) : isCurrent ? (
                  'Plano Atual'
                ) : (
                  'Assinar Plano'
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-16 flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <CreditCard className="mb-4 h-8 w-8 text-slate-400" />
        <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Gerenciar Assinatura e Faturas</h3>
        <p className="mb-6 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Você pode alterar seu cartão de crédito, baixar recibos e cancelar sua assinatura a qualquer momento através do Portal do Cliente do Stripe.
        </p>
        <button
          onClick={handlePortal}
          disabled={loadingPlan === 'PORTAL'}
          className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700"
        >
          {loadingPlan === 'PORTAL' ? 'Abrindo...' : 'Acessar Portal Financeiro'}
        </button>
      </div>
    </div>
  );
}
