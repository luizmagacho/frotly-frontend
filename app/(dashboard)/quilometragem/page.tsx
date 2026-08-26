'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Gauge } from 'lucide-react';

export default function MileagePage() {
  const { data, isLoading } = useQuery({ queryKey: ['mileage'], queryFn: () => api.get<any>('/mileage', { limit: 100 }) });
  const items = data?.data || data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quilometragem</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Registros de quilometragem por veículo</p>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 dark:border-slate-700">
          <Gauge className="mb-4 h-12 w-12 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nenhum registro de quilometragem</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Controle periódico de km por veículo</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Veículo</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Quilometragem</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {items.map((m: any) => (
                <tr key={m._id}>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{m.vehicleId?.licensePlate || m.vehicleId?.plate || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{new Date(m.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{m.mileage.toLocaleString('pt-BR')} km</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {m.source === 'REFUEL' ? 'Abastecimento' : 'Manual'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
