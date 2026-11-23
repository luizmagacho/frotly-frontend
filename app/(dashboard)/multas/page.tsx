'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, Clock, Gavel, HandCoins, Plus, Search, Trash2, User } from 'lucide-react';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/shared-utils';
import { DetranPanel } from './detran-panel';

const FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'PENDING', label: 'A pagar' },
  { value: 'OVERDUE', label: 'Vencidas' },
  { value: 'APPEALED', label: 'Em recurso' },
  { value: 'PAID', label: 'Pagas' },
  { value: 'CANCELLED', label: 'Canceladas' },
];

function statusBadge(f: any) {
  const overdue = f.status === 'PENDING' && f.dueDate && new Date(f.dueDate) < new Date();
  if (overdue) return { label: 'Vencida', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  switch (f.status) {
    case 'PAID': return { label: 'Paga', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    case 'APPEALED': return { label: 'Em recurso', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    case 'CANCELLED': return { label: 'Cancelada', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' };
    default: return { label: 'A pagar', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
  }
}

export default function FinesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['fines', status, search],
    queryFn: () => api.get<any>('/fines', { limit: 100, status: status || undefined, search: search.trim() || undefined }),
  });
  const { data: summary } = useQuery({ queryKey: ['fines-summary'], queryFn: () => api.get<any>('/fines/summary') });

  const fines: any[] = Array.isArray(data) ? data : data?.data || [];
  const total = data?.total ?? fines.length;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['fines'] });
    queryClient.invalidateQueries({ queryKey: ['fines-summary'] });
  };
  const onError = (err: any) => {
    const msg = err.response?.data?.message;
    toast.error(Array.isArray(msg) ? msg[0] : msg || err.message || 'Não foi possível concluir a ação.');
  };

  const pay = useMutation({
    mutationFn: (id: string) => api.patch(`/fines/${id}/pay`, {}),
    onSuccess: () => { toast.success('Multa marcada como paga.'); refresh(); },
    onError,
  });
  const chargePaid = useMutation({
    mutationFn: (id: string) => api.patch(`/fines/${id}/driver-charge/pay`, {}),
    onSuccess: () => { toast.success('Repasse do motorista registrado como recebido.'); refresh(); },
    onError,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/fines/${id}`),
    onSuccess: () => { toast.success('Multa excluída.'); refresh(); },
    onError,
  });

  const confirmDelete = (f: any) =>
    toast(`Excluir a multa ${f.noticeNumber}?`, {
      description: 'Os lançamentos dela no financeiro também serão removidos.',
      action: { label: 'Excluir', onClick: () => remove.mutate(f._id) },
      cancel: { label: 'Cancelar', onClick: () => {} },
    });

  const cards = [
    { label: 'A pagar', icon: Clock, tone: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20', d: summary?.pending },
    { label: 'Vencidas', icon: AlertTriangle, tone: 'text-red-600 bg-red-50 dark:bg-red-900/20', d: summary?.overdue },
    { label: 'Em recurso', icon: Gavel, tone: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', d: summary?.appealed },
    { label: 'A cobrar dos motoristas', icon: HandCoins, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', d: summary?.toChargeFromDrivers },
  ];

  const th = 'px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Multas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Autos de infração da frota, motorista responsável e repasse</p>
        </div>
        <Link href="/multas/novo" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Nova Multa
        </Link>
      </div>

      <DetranPanel />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, icon: Icon, tone, d }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
              <span className={`rounded-lg p-2 ${tone}`}><Icon className="h-4 w-4" /></span>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(d?.value ?? 0)}</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {d?.count ?? 0} {d?.count === 1 ? 'multa' : 'multas'}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                status === f.value
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por auto, infração ou local..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      ) : fines.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 dark:border-slate-700">
          <AlertTriangle className="mb-4 h-12 w-12 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            {status || search ? 'Nenhuma multa encontrada com esses filtros' : 'Nenhuma multa registrada'}
          </h3>
          {!status && !search && (
            <Link href="/multas/novo" className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">Registrar a primeira multa</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                  <th className={th}>Infração</th>
                  <th className={th}>Veículo</th>
                  <th className={th}>Motorista</th>
                  <th className={th}>Valor</th>
                  <th className={th}>Vencimento</th>
                  <th className={th}>Situação</th>
                  <th className={`${th} text-right`}>Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {fines.map((f) => {
                  const badge = statusBadge(f);
                  const open = f.status === 'PENDING' || f.status === 'APPEALED';
                  const chargeOpen = f.chargeToDriver && f.driverChargeStatus !== 'PAID' && f.status !== 'CANCELLED';
                  return (
                    <tr
                      key={f._id}
                      onClick={() => router.push(`/multas/${f._id}`)}
                      className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="max-w-xs px-4 py-3">
                        <div className="truncate text-sm font-medium text-slate-900 dark:text-white" title={f.description}>{f.description}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          AIT {f.noticeNumber} · {formatDate(f.infractionDate)}{f.issuingAgency ? ` · ${f.issuingAgency}` : ''}
                          {f.source?.startsWith('DETRAN_') && (
                            <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              Detran
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-slate-900 dark:text-white">{f.vehicleId?.licensePlate || '-'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{f.vehicleId ? `${f.vehicleId.brand} ${f.vehicleId.model}` : ''}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {f.driverId?.name ? (
                          <div className="flex items-center gap-1.5 whitespace-nowrap text-slate-700 dark:text-slate-300">
                            <User className="h-3.5 w-3.5 shrink-0 text-slate-400" /> {f.driverId.name}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                        {f.chargeToDriver && (
                          <span className={`mt-1 inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium ${
                            f.driverChargeStatus === 'PAID'
                              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                          }`}>
                            {f.driverChargeStatus === 'PAID' ? 'Repasse recebido' : 'Repasse pendente'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-slate-900 dark:text-white">{formatCurrency(f.value)}</div>
                        {f.points > 0 && <div className="text-xs text-slate-500 dark:text-slate-400">{f.points} pontos</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{f.dueDate ? formatDate(f.dueDate) : '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          {open && (
                            <button
                              onClick={() => pay.mutate(f._id)}
                              disabled={pay.isPending}
                              title="Marcar como paga"
                              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                            >
                              <CheckCircle2 className="h-4 w-4" /> Pagar
                            </button>
                          )}
                          {chargeOpen && (
                            <button
                              onClick={() => chargePaid.mutate(f._id)}
                              disabled={chargePaid.isPending}
                              title="Motorista pagou o repasse"
                              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                            >
                              <HandCoins className="h-4 w-4" /> Repasse
                            </button>
                          )}
                          <button
                            onClick={() => confirmDelete(f)}
                            title="Excluir"
                            aria-label={`Excluir multa ${f.noticeNumber}`}
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
            {total} {total === 1 ? 'multa' : 'multas'}
          </div>
        </div>
      )}
    </div>
  );
}
