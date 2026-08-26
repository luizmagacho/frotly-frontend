'use client';

import { Suspense, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/shared-utils';

function FleetOverview() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'financial'],
    queryFn: () => api.get<any>('/reports/financial'),
  });

  const allRows = data?.data || data || [];

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((r: any) =>
      r.name?.toLowerCase().includes(q) ||
      r.licensePlate?.toLowerCase().includes(q) ||
      r.driverName?.toLowerCase().includes(q)
    );
  }, [allRows, search]);

  if (isLoading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />)}</div>;

  if (!allRows.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 dark:border-slate-700">
        <Wallet className="mb-4 h-12 w-12 text-slate-400" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nenhum veículo encontrado</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Comece adicionando veículos à sua frota.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por veículo, placa ou motorista..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 dark:border-slate-700">
          <Search className="mb-4 h-12 w-12 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nenhum resultado para "{search}"</h3>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rows.map((r: any) => (
        <div
          key={r.vehicleId}
          onClick={() => router.push(`/financeiro/${r.vehicleId}`)}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{r.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{r.licensePlate}{r.driverName ? ` · ${r.driverName}` : ''}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><TrendingUp className="h-3.5 w-3.5 text-green-500" /> Receita</span>
              <span className="font-medium text-slate-900 dark:text-slate-300">{formatCurrency(r.revenue)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><TrendingDown className="h-3.5 w-3.5 text-red-500" /> Custos</span>
              <span className="font-medium text-slate-900 dark:text-slate-300">{formatCurrency(r.maintenanceCost)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/50">
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"><DollarSign className="h-4 w-4 text-blue-500" /> Saldo</span>
              <span className={`font-bold ${r.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>{formatCurrency(r.profit)}</span>
            </div>
          </div>
        </div>
      ))}
      </div>
      )}
    </div>
  );
}

export default function FinancialPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financeiro</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Selecione um veículo para ver o livro caixa e lançamentos.</p>
        </div>
      </div>

      <Suspense fallback={<div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />}>
        <FleetOverview />
      </Suspense>
    </div>
  );
}
