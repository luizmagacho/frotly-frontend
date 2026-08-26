'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Pencil, Wrench } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/shared-utils';

const typeLabels: Record<string, string> = {
  PREVENTIVE: 'Preventiva',
  CORRECTIVE: 'Corretiva',
  INSPECTION: 'Revisão',
};
const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const statusLabels: Record<string, string> = {
  SCHEDULED: 'Agendado',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

function MaintenanceDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const [showComplete, setShowComplete] = useState(false);
  const [finalCost, setFinalCost] = useState(0);
  const [completeNotes, setCompleteNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => api.get<any>(`/maintenances/${id}`),
  });
  const maintenance = data?.data || data;

  const completeMutation = useMutation({
    mutationFn: () => api.put(`/maintenances/${id}/complete`, { cost: finalCost, notes: completeNotes || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success('Manutenção marcada como concluída!');
      setShowComplete(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || err.message || 'Erro ao concluir manutenção'));
    },
  });

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setFinalCost(Number(value) / 100);
  };

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />;
  if (!maintenance) return <p className="text-sm text-slate-500 dark:text-slate-400">Manutenção não encontrada.</p>;

  const vehicle = maintenance.vehicleId;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/manutencoes" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{maintenance.description}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {vehicle ? `${vehicle.brand} ${vehicle.model} · ${vehicle.licensePlate}` : 'Veículo não encontrado'}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[maintenance.status] || ''}`}>
          {statusLabels[maintenance.status] || maintenance.status}
        </span>
        <Link
          href={`/manutencoes/${maintenance._id}/editar`}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Pencil className="h-4 w-4" /> Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase text-slate-400 dark:text-slate-500">Tipo</p>
          <p className="mt-1 text-sm text-slate-900 dark:text-white">{typeLabels[maintenance.type] || maintenance.type}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-400 dark:text-slate-500">Data Agendada</p>
          <p className="mt-1 text-sm text-slate-900 dark:text-white">{formatDate(maintenance.scheduledDate)}</p>
        </div>
        {maintenance.completedDate && (
          <div>
            <p className="text-xs font-medium uppercase text-slate-400 dark:text-slate-500">Data de Conclusão</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-white">{formatDate(maintenance.completedDate)}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-medium uppercase text-slate-400 dark:text-slate-500">Custo</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(maintenance.cost || 0)}</p>
        </div>
        {maintenance.workshopName && (
          <div>
            <p className="text-xs font-medium uppercase text-slate-400 dark:text-slate-500">Oficina</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-white">{maintenance.workshopName}{maintenance.workshopPhone ? ` · ${maintenance.workshopPhone}` : ''}</p>
          </div>
        )}
        {maintenance.mileageAtService != null && (
          <div>
            <p className="text-xs font-medium uppercase text-slate-400 dark:text-slate-500">KM no Serviço</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-white">{maintenance.mileageAtService.toLocaleString('pt-BR')} km</p>
          </div>
        )}
        {maintenance.services?.length > 0 && (
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase text-slate-400 dark:text-slate-500">Serviços</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {maintenance.services.map((s: string, i: number) => (
                <span key={i} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">{s}</span>
              ))}
            </div>
          </div>
        )}
        {maintenance.notes && (
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase text-slate-400 dark:text-slate-500">Observações</p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{maintenance.notes}</p>
          </div>
        )}
      </div>

      {maintenance.status !== 'COMPLETED' && maintenance.status !== 'CANCELLED' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          {!showComplete ? (
            <button
              onClick={() => { setFinalCost(maintenance.cost || 0); setShowComplete(true); }}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4" /> Marcar como Concluída
            </button>
          ) : (
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Wrench className="h-4 w-4" /> Concluir Manutenção
              </h3>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Custo Final (R$)</label>
                <input
                  type="text"
                  className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalCost || 0)}
                  onChange={handleCostChange}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Observações (opcional)</label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  rows={2}
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowComplete(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => completeMutation.mutate()}
                  disabled={completeMutation.isPending}
                  className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {completeMutation.isPending ? 'Salvando...' : 'Confirmar Conclusão'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MaintenanceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  return <MaintenanceDetail id={params.id} />;
}
