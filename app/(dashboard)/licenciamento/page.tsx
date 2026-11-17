'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, Clock, FileCheck, FileQuestion, Plus, Search, Trash2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/shared-utils';

const listOf = (res: any): any[] => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);

const isOverdue = (l: any) => l.status === 'OVERDUE' || (l.status === 'PENDING' && l.dueDate && new Date(l.dueDate) < new Date());

function badge(l: any) {
  if (l.status === 'PAID') return { label: 'Pago', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
  if (isOverdue(l)) return { label: 'Vencido', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  return { label: 'A pagar', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
}

type Filter = '' | 'PENDING' | 'OVERDUE' | 'PAID' | 'MISSING';

export default function LicensingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const year = new Date().getFullYear();
  const [filter, setFilter] = useState<Filter>('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['licensing'], queryFn: () => api.get<any>('/licensing') });
  const { data: vehiclesRes } = useQuery({ queryKey: ['vehicles', 'all'], queryFn: () => api.get<any>('/vehicles', { limit: 200 }) });
  const items = listOf(data);
  const vehicles = listOf(vehiclesRes);

  const summary = useMemo(() => {
    const sum = (l: any[]) => l.reduce((s, x) => s + (x.value || 0), 0);
    const pending = items.filter((l) => l.status !== 'PAID' && !isOverdue(l));
    const overdue = items.filter(isOverdue);
    const paidYear = items.filter((l) => l.status === 'PAID' && l.year === year);
    const covered = new Set(items.filter((l) => l.year === year).map((l) => l.vehicleId?._id ?? l.vehicleId));
    const missing = vehicles.filter((v) => !covered.has(v._id) && v.status !== 'INACTIVE');
    return { pending, overdue, paidYear, missing, sum };
  }, [items, vehicles, year]);

  const q = search.trim().toLowerCase();
  const matches = (plate?: string, model?: string) => !q || `${plate ?? ''} ${model ?? ''}`.toLowerCase().includes(q);

  const rows = items.filter((l) => {
    if (!matches(l.vehicleId?.licensePlate, `${l.vehicleId?.brand ?? ''} ${l.vehicleId?.model ?? ''}`)) return false;
    if (filter === 'PAID') return l.status === 'PAID';
    if (filter === 'OVERDUE') return isOverdue(l);
    if (filter === 'PENDING') return l.status !== 'PAID' && !isOverdue(l);
    return true;
  });
  const missingRows = summary.missing.filter((v) => matches(v.licensePlate, `${v.brand} ${v.model}`));

  const onError = (err: any) => {
    const msg = err.response?.data?.message;
    toast.error(Array.isArray(msg) ? msg[0] : msg || err.message || 'Não foi possível concluir a ação.');
  };
  const pay = useMutation({
    mutationFn: (id: string) => api.patch(`/licensing/${id}/pay`, {}),
    onSuccess: () => { toast.success('Licenciamento marcado como pago.'); queryClient.invalidateQueries({ queryKey: ['licensing'] }); },
    onError,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/licensing/${id}`),
    onSuccess: () => { toast.success('Licenciamento excluído.'); queryClient.invalidateQueries({ queryKey: ['licensing'] }); },
    onError,
  });
  const confirmDelete = (l: any) =>
    toast(`Excluir o licenciamento ${l.year} de ${l.vehicleId?.licensePlate ?? 'este veículo'}?`, {
      description: 'O lançamento dele no financeiro também será removido.',
      action: { label: 'Excluir', onClick: () => remove.mutate(l._id) },
      cancel: { label: 'Cancelar', onClick: () => {} },
    });

  const cards: { key: Filter; label: string; icon: any; tone: string; count: number; value?: number; hint?: string }[] = [
    { key: 'PENDING', label: 'A pagar', icon: Clock, tone: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20', count: summary.pending.length, value: summary.sum(summary.pending) },
    { key: 'OVERDUE', label: 'Vencidos', icon: AlertTriangle, tone: 'text-red-600 bg-red-50 dark:bg-red-900/20', count: summary.overdue.length, value: summary.sum(summary.overdue) },
    { key: 'PAID', label: `Pagos em ${year}`, icon: CheckCircle2, tone: 'text-green-600 bg-green-50 dark:bg-green-900/20', count: summary.paidYear.length, value: summary.sum(summary.paidYear) },
    { key: 'MISSING', label: `Sem licenciamento ${year}`, icon: FileQuestion, tone: 'text-slate-600 bg-slate-100 dark:bg-slate-800', count: summary.missing.length, hint: 'veículos sem registro' },
  ];

  const FILTERS: { value: Filter; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'PENDING', label: 'A pagar' },
    { value: 'OVERDUE', label: 'Vencidos' },
    { value: 'PAID', label: 'Pagos' },
    { value: 'MISSING', label: `Sem registro ${year}` },
  ];

  const th = 'px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Licenciamento</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Controle do licenciamento anual (CRLV) da frota</p>
        </div>
        <Link href="/licenciamento/novo" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Novo
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ key, label, icon: Icon, tone, count, value, hint }) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? '' : key)}
            className={`rounded-xl border bg-white p-5 text-left transition-colors dark:bg-slate-900 ${
              filter === key ? 'border-slate-900 dark:border-white' : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
              <span className={`rounded-lg p-2 ${tone}`}><Icon className="h-4 w-4" /></span>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{value !== undefined ? formatCurrency(value) : count}</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{value !== undefined ? `${count} ${count === 1 ? 'veículo' : 'veículos'}` : hint}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por placa ou modelo..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      ) : filter === 'MISSING' ? (
        missingRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 dark:border-slate-700">
            <CheckCircle2 className="mb-4 h-12 w-12 text-green-500" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Todos os veículos têm licenciamento {year} registrado</h3>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                  <th className={th}>Veículo</th>
                  <th className={th}>Situação {year}</th>
                  <th className={`${th} text-right`}>Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {missingRows.map((v) => (
                  <tr key={v._id}>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-slate-900 dark:text-white">{v.licensePlate}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{v.brand} {v.model}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">Sem registro</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/licenciamento/novo?vehicleId=${v._id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        Registrar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 dark:border-slate-700">
          <FileCheck className="mb-4 h-12 w-12 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            {filter || search ? 'Nenhum licenciamento encontrado com esses filtros' : 'Nenhum licenciamento registrado'}
          </h3>
          {!filter && !search && (
            <Link href="/licenciamento/novo" className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">Registrar o primeiro</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                  <th className={th}>Veículo</th>
                  <th className={th}>Ano</th>
                  <th className={th}>Valor</th>
                  <th className={th}>Vencimento</th>
                  <th className={th}>Situação</th>
                  <th className={`${th} text-right`}>Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.map((l) => {
                  const b = badge(l);
                  return (
                    <tr
                      key={l._id}
                      onClick={() => router.push(`/licenciamento/${l._id}`)}
                      className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-slate-900 dark:text-white">{l.vehicleId?.licensePlate || '-'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{l.vehicleId ? `${l.vehicleId.brand} ${l.vehicleId.model}` : ''}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{l.year}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(l.value)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        {formatDate(l.dueDate)}
                        {l.status === 'PAID' && l.paidAt && <div className="text-xs text-slate-500 dark:text-slate-400">pago em {formatDate(l.paidAt)}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${b.cls}`}>{b.label}</span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          {l.status !== 'PAID' && (
                            <button
                              onClick={() => pay.mutate(l._id)}
                              disabled={pay.isPending}
                              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                            >
                              <CheckCircle2 className="h-4 w-4" /> Pagar
                            </button>
                          )}
                          <button
                            onClick={() => confirmDelete(l)}
                            aria-label={`Excluir licenciamento ${l.year} de ${l.vehicleId?.licensePlate ?? ''}`}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {rows.length} {rows.length === 1 ? 'registro' : 'registros'}
          </div>
        </div>
      )}
    </div>
  );
}
