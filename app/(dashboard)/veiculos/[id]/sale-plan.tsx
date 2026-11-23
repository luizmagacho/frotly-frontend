'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock, Sparkles, RefreshCw, TrendingUp, Gauge, Tag, Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

type Option = { code: string; name: string };

const card = 'rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900';
const select =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const brl = (n: number) => formatCurrency(Math.round(n));
const mes = (d: string) => new Date(d).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

/** Escolha da versão na tabela FIPE (marca → modelo → ano) e vínculo com o veículo. */
function FipePicker({ vehicleId, onDone, onCancel }: { vehicleId: string; onDone: () => void; onCancel?: () => void }) {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [filter, setFilter] = useState('');

  const brands = useQuery({ queryKey: ['fipe', 'brands'], queryFn: () => api.get<Option[]>('/fipe/brands'), staleTime: 86_400_000 });
  const models = useQuery({
    queryKey: ['fipe', 'models', brand],
    queryFn: () => api.get<Option[]>(`/fipe/brands/${brand}/models`),
    enabled: !!brand,
    staleTime: 86_400_000,
  });
  const years = useQuery({
    queryKey: ['fipe', 'years', brand, model],
    queryFn: () => api.get<Option[]>(`/fipe/brands/${brand}/models/${model}/years`),
    enabled: !!brand && !!model,
    staleTime: 86_400_000,
  });
  const filtered = useMemo(
    () => (models.data ?? []).filter((m) => m.name.toLowerCase().includes(filter.toLowerCase())),
    [models.data, filter],
  );

  const save = useMutation({
    mutationFn: async () => {
      const r = await api.get<any>(`/fipe/brands/${brand}/models/${model}/years/${year}`);
      await api.put(`/vehicles/${vehicleId}`, { fipeCode: r.fipeCode, fipeYearCode: r.fipeYearCode, fipeModelName: r.fipeModelName });
      return r;
    },
    onSuccess: (r) => {
      toast.success(`Vinculado à FIPE: ${r.fipeModelName}`);
      onDone();
    },
    onError: (e: any) => toast.error(e?.message || 'Não foi possível vincular à FIPE.'),
  });

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Escolha a versão do carro na tabela FIPE. O valor e o histórico de preço dessa versão são usados no plano de venda.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="fipe-brand" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Marca</label>
          <select id="fipe-brand" className={select} value={brand} onChange={(e) => { setBrand(e.target.value); setModel(''); setYear(''); }}>
            <option value="">{brands.isLoading ? 'Carregando…' : 'Selecione'}</option>
            {(brands.data ?? []).map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="fipe-filter" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Buscar modelo</label>
          <input id="fipe-filter" className={select} placeholder="Ex.: Onix 1.0" value={filter} onChange={(e) => setFilter(e.target.value)} disabled={!brand} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="fipe-model" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Versão</label>
          <select id="fipe-model" className={select} value={model} onChange={(e) => { setModel(e.target.value); setYear(''); }} disabled={!brand}>
            <option value="">{models.isLoading ? 'Carregando…' : `Selecione (${filtered.length})`}</option>
            {filtered.map((m) => <option key={m.code} value={m.code}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="fipe-year" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Ano-modelo</label>
          <select id="fipe-year" className={select} value={year} onChange={(e) => setYear(e.target.value)} disabled={!model}>
            <option value="">{years.isLoading ? 'Carregando…' : 'Selecione'}</option>
            {(years.data ?? []).map((y) => <option key={y.code} value={y.code}>{y.name.replace(/^32000/, 'Zero km')}</option>)}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={!year || save.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Vincular à FIPE
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Plano de venda do veículo: melhor momento pela FIPE e pela rodagem — plano Pro. */
export function SalePlan({ vehicleId }: { vehicleId: string }) {
  const qc = useQueryClient();
  const [editingFipe, setEditingFipe] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ['sale-plan', vehicleId],
    queryFn: () => api.get<any>(`/reports/sale-plan/${vehicleId}`),
    retry: false,
  });
  const reload = () => qc.invalidateQueries({ queryKey: ['sale-plan', vehicleId] });
  const refresh = async () => {
    setRefreshing(true);
    try {
      const fresh = await api.get<any>(`/reports/sale-plan/${vehicleId}`, { refresh: 1 });
      qc.setQueryData(['sale-plan', vehicleId], fresh);
    } finally {
      setRefreshing(false);
    }
  };

  const status = (error as any)?.response?.data?.statusCode;
  const title = (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Plano de venda</h3>
        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">Pro</span>
      </div>
      {data && !data.needsFipe && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" /> {data.aiSource === 'llm' ? 'Análise por IA' : 'Cálculo automático'}
          </span>
          <button type="button" onClick={refresh} disabled={refreshing} aria-label="Atualizar plano" className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );

  if (status === 403) {
    return (
      <section id="plano-de-venda" className={`${card} flex flex-col gap-4 sm:flex-row sm:items-center`}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"><Lock className="h-5 w-5" /></div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white">Plano de venda — plano Pro</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Saiba o melhor momento de vender cada carro, pela tabela FIPE e pela rodagem semanal.</p>
        </div>
        <Link href="/planos" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Ver planos</Link>
      </section>
    );
  }

  if (isLoading) return <section id="plano-de-venda" className={card}>{title}<div className="h-40 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" /></section>;
  if (error) return <section id="plano-de-venda" className={card}>{title}<p className="text-sm text-slate-500">{(error as any)?.message || 'Não foi possível montar o plano agora.'}</p></section>;

  if (data.needsFipe || editingFipe) {
    return (
      <section id="plano-de-venda" className={card}>
        {title}
        <FipePicker vehicleId={vehicleId} onDone={() => { setEditingFipe(false); reload(); }} onCancel={editingFipe ? () => setEditingFipe(false) : undefined} />
      </section>
    );
  }

  const r = data.recommended;
  const kpis = [
    { label: `FIPE (${data.fipe.referenceMonth})`, value: brl(data.fipe.price), sub: `${String(data.fipe.monthlyDepreciationPct).replace('.', ',')}% de queda ao mês`, icon: Tag },
    { label: 'Venda estimada hoje', value: brl(data.estimatedSaleValueNow), sub: `${data.kmNow.toLocaleString('pt-BR')} km`, icon: Wallet },
    {
      label: 'Rodagem por semana',
      value: `${data.kmPerWeek.toLocaleString('pt-BR')} km`,
      sub: data.weeklyKmLimit ? `limite ${Number(data.weeklyKmLimit).toLocaleString('pt-BR')} km` : 'sem limite no contrato',
      icon: Gauge,
      alert: data.weeklyKmLimit && data.kmPerWeek > data.weeklyKmLimit,
    },
    { label: 'Lucro líquido por semana', value: brl(data.weeklyNetNow), sub: 'aluguel − custos − desvalorização', icon: TrendingUp },
  ];

  return (
    <section id="plano-de-venda" className={card}>
      {title}

      <div className="rounded-lg border border-red-100 bg-red-50/60 p-4 dark:border-red-900/40 dark:bg-red-950/20">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{data.ai.recomendacao}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{data.ai.resumo}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><k.icon className="h-3.5 w-3.5" />{k.label}</div>
            <div className={`mt-1 text-lg font-bold ${k.alert ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{k.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="py-2 pr-3">Cenário</th>
              <th className="py-2 pr-3 text-right">Km</th>
              <th className="py-2 pr-3 text-right">Venda</th>
              <th className="py-2 pr-3 text-right">Aluguel líquido até lá</th>
              <th className="py-2 text-right">Resultado vs. hoje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {[...data.scenarios, ...(r && r.week > 0 && !data.scenarios.some((s: any) => s.week === r.week) ? [{ ...r, label: `Recomendado (${mes(r.date)})`, recommended: true }] : [])]
              .sort((a: any, b: any) => a.week - b.week)
              .map((s: any) => (
                <tr key={s.label} className={s.recommended ? 'bg-red-50/60 font-medium dark:bg-red-950/20' : ''}>
                  <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">{s.label}</td>
                  <td className="py-2 pr-3 text-right text-slate-700 dark:text-slate-300">{s.km.toLocaleString('pt-BR')}</td>
                  <td className="py-2 pr-3 text-right text-slate-900 dark:text-white">{brl(s.value)}</td>
                  <td className="py-2 pr-3 text-right text-slate-700 dark:text-slate-300">{brl(s.cashAccumulated)}</td>
                  <td className={`py-2 text-right ${s.gainVsNow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {s.week === 0 ? '—' : `${s.gainVsNow >= 0 ? '+' : ''}${brl(s.gainVsNow)}`}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {data.ai.pontos?.length > 0 && (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          {data.ai.pontos.map((p: string) => <li key={p}>{p}</li>)}
        </ul>
      )}

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        Versão FIPE: {data.vehicle.fipeModelName || data.fipe.model} ·{' '}
        <button type="button" onClick={() => setEditingFipe(true)} className="underline hover:text-slate-700 dark:hover:text-slate-200">trocar</button>
        . Estimativa: desvalorização pela FIPE dos últimos 12 meses; −1,5% na revenda a cada 10 mil km acima de 15 mil km/ano e −5% a partir de 100 mil km;
        custos dos últimos 6 meses sem combustível (fica com o motorista). Não é garantia de preço de venda.
      </p>
    </section>
  );
}
