'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Lock, Route, Gauge, TrendingDown, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

type Row = {
  vehicleId: string;
  licensePlate: string;
  name: string;
  kmInPeriod: number;
  kmPerDay: number;
  kmPerWeek: number;
  weeklyKmLimit: number | null;
  overLimit: boolean;
  excessKm: number;
  excessKmValue: number | null;
  driverName: string | null;
  readingsInPeriod: number;
  lastReadingAt: string | null;
  income: number;
  expenses: number;
  costPerKm: number | null;
  revenuePerKm: number | null;
  marginPerKm: number | null;
};

type Report = {
  days: number;
  totals: {
    kmInPeriod: number;
    kmPerDay: number;
    kmPerWeekPerVehicle: number;
    vehiclesOverLimit: number;
    excessKm: number;
    excessKmValue: number;
    costPerKm: number | null;
    revenuePerKm: number | null;
    vehiclesWithoutReadings: number;
  };
  vehicles: Row[];
};

const PERIODS = [30, 90, 180];
const km = (n: number) => `${Math.round(n).toLocaleString('pt-BR')} km`;
const perKm = (n: number | null) => (n == null ? '—' : `${formatCurrency(n)}/km`);

/** Rodagem e custo por km por veículo — recurso do plano Pro. */
export function MileageReport() {
  const [days, setDays] = useState(90);
  const { data, isLoading, error } = useQuery<Report>({
    queryKey: ['reports', 'mileage', days],
    queryFn: () => api.get<Report>('/reports/mileage', { days }),
    retry: false,
  });

  const forbidden = (error as any)?.response?.data?.statusCode === 403;

  if (forbidden) {
    return (
      <section className="flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <Lock className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-slate-900 dark:text-white">Rodagem e custo por km — plano Pro</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Veja quantos km cada carro rodou, quanto custou e quanto rendeu por km, e descubra quais veículos dão lucro de verdade.
          </p>
        </div>
        <Link href="/planos" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
          Ver planos
        </Link>
      </section>
    );
  }

  const rows = (data?.vehicles ?? []).filter((r) => r.readingsInPeriod > 0 || r.kmInPeriod > 0);
  const t = data?.totals;

  const cards = [
    { label: `Km rodados (${days} dias)`, value: t ? km(t.kmInPeriod) : '—', icon: Route },
    { label: 'Média por carro/semana', value: t ? km(t.kmPerWeekPerVehicle) : '—', icon: Gauge },
    { label: 'Custo por km (sem combustível)', value: perKm(t?.costPerKm ?? null), icon: TrendingDown },
    {
      label: 'Km acima do limite semanal',
      value: t ? km(t.excessKm) : '—',
      sub: t && t.excessKm > 0 ? `${t.vehiclesOverLimit} carro(s) com média acima do limite · ${formatCurrency(t.excessKmValue)} a cobrar` : undefined,
      icon: AlertTriangle,
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Rodagem e custo por km</h2>
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">Pro</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Km rodado por veículo (reporte semanal do motorista e leituras de km), limite semanal do contrato e quanto cada km custou e rendeu.
          </p>
        </div>
        <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700" role="group" aria-label="Período">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setDays(p)}
              aria-pressed={days === p}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                days === p
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {p} dias
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <c.icon className="h-4 w-4" />
              {c.label}
            </div>
            <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{isLoading ? '…' : c.value}</div>
            {'sub' in c && c.sub && <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{c.sub}</div>}
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      ) : error ? (
        <p className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800">Não foi possível carregar o relatório.</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Nenhuma leitura de km nos últimos {days} dias. Registre a quilometragem dos veículos para ver a rodagem e o custo por km.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[880px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                <th className="px-4 py-3">Veículo</th>
                <th className="px-4 py-3 text-right">Km no período</th>
                <th className="px-4 py-3 text-right">Km/semana</th>
                <th className="px-4 py-3 text-right">Excedente</th>
                <th className="px-4 py-3 text-right">Custo/km</th>
                <th className="px-4 py-3 text-right">Receita/km</th>
                <th className="px-4 py-3 text-right">Margem/km</th>
                <th className="px-4 py-3 text-right">Última leitura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm dark:divide-slate-800">
              {rows.map((r) => (
                <tr key={r.vehicleId}>
                  <td className="px-4 py-3">
                    <Link href={`/veiculos/${r.vehicleId}#plano-de-venda`} className="font-medium text-slate-900 hover:text-red-600 hover:underline dark:text-white" title="Ver plano de venda">
                      {r.licensePlate}
                    </Link>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{r.name}{r.driverName ? ` · ${r.driverName}` : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">{km(r.kmInPeriod)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className={r.overLimit ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}>
                      {Math.round(r.kmPerWeek).toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-slate-400">{r.weeklyKmLimit ? `limite ${r.weeklyKmLimit.toLocaleString('pt-BR')}` : 'sem limite'}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {r.excessKm > 0 ? (
                      <>
                        <div className="font-medium text-red-600 dark:text-red-400">{km(r.excessKm)}</div>
                        {r.excessKmValue != null && <div className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(r.excessKmValue)}</div>}
                      </>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{perKm(r.costPerKm)}</td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{perKm(r.revenuePerKm)}</td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      r.marginPerKm == null
                        ? 'text-slate-400'
                        : r.marginPerKm >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {perKm(r.marginPerKm)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-500 dark:text-slate-400">
                    {r.lastReadingAt ? new Date(r.lastReadingAt).toLocaleDateString('pt-BR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {t && t.vehiclesWithoutReadings > 0 && (
            <p className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              {t.vehiclesWithoutReadings} veículo(s) sem leitura de km no período não entram no cálculo.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
