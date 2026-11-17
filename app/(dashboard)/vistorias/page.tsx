'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { ClipboardCheck, Plus, Car, User, Gauge, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function VistoriasPage() {
  const [vistorias, setVistorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = (await api.get('/inspections')) as any;
      // O endpoint devolve a lista direto; aceita também o formato paginado { data: [...] }.
      const list = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];
      setVistorias(list);
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
      toast.error('Erro ao carregar vistorias');
    } finally {
      setLoading(false);
    }
  };

  const getVehicleDisplay = (vehicleId: any) => {
    if (!vehicleId) return 'Desconhecido';
    if (typeof vehicleId === 'object' && (vehicleId.licensePlate || vehicleId.plate)) {
      return `${vehicleId.brand} ${vehicleId.model} (${vehicleId.licensePlate || vehicleId.plate})`;
    }
    return 'Veículo';
  };

  const getDriverDisplay = (driverId: any) => {
    if (!driverId) return 'Desconhecido';
    if (typeof driverId === 'object' && driverId.name) {
      return driverId.name;
    }
    return 'Motorista';
  };

  const th = 'px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vistorias</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Registro de entrada e saída de veículos da frota</p>
        </div>
        <Link
          href="/vistorias/nova"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nova Vistoria
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                <th className={th}>Tipo / Data</th>
                <th className={th}>Veículo</th>
                <th className={th}>Motorista</th>
                <th className={th}>Hodômetro</th>
                <th className={th}>Vistoriador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                      Carregando vistorias...
                    </div>
                  </td>
                </tr>
              ) : vistorias.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardCheck className="h-12 w-12 text-slate-400" />
                      <span className="text-lg font-medium text-slate-900 dark:text-white">Nenhuma vistoria registrada</span>
                    </div>
                  </td>
                </tr>
              ) : (
                vistorias.map((vistoria) => (
                  <tr key={vistoria._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <span
                          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            vistoria.type === 'SAIDA'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                          {vistoria.type === 'SAIDA' ? 'Saída' : 'Devolução (Entrada)'}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(vistoria.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                        <Car className="h-4 w-4 text-slate-400" />
                        {getVehicleDisplay(vistoria.vehicleId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <User className="h-4 w-4 text-slate-400" />
                        {getDriverDisplay(vistoria.driverId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                        <Gauge className="h-4 w-4 text-blue-500" />
                        {vistoria.mileage != null ? `${vistoria.mileage.toLocaleString('pt-BR')} km` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{vistoria.inspectorName || '-'}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {vistoria.damages?.length > 0 ? `${vistoria.damages.length} avarias` : 'Sem avarias'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
