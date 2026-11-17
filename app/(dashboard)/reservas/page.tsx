'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { CalendarRange, Plus, Calendar, Car, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils';

const listOf = (res: any): any[] => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);

export default function ReservasPage() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reservasRes, clientesRes] = await Promise.all([
        api.get('/reservations', { limit: 100 }) as any,
        api.get('/customers', { limit: 100 }) as any,
      ]);
      setReservas(listOf(reservasRes));
      setClientes(listOf(clientesRes));
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
      toast.error('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock, label: 'Pendente' };
      case 'CONFIRMED':
        return { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle, label: 'Confirmada' };
      case 'COMPLETED':
        return { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle, label: 'Concluída' };
      case 'CANCELLED':
        return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Cancelada' };
      default:
        return { color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', icon: Clock, label: status };
    }
  };

  // customerId pode vir populado (objeto) ou como id puro.
  const getCustomerName = (id: any) => {
    if (typeof id === 'object' && id !== null && id.name) return id.name;
    const customer = clientes.find((c) => c._id === id);
    return customer ? customer.name : 'Desconhecido';
  };

  const getVehicleDisplay = (vehicleId: any) => {
    if (!vehicleId) return 'A definir';
    if (typeof vehicleId === 'object' && (vehicleId.licensePlate || vehicleId.plate)) {
      return `${vehicleId.brand} ${vehicleId.model} (${vehicleId.licensePlate || vehicleId.plate})`;
    }
    return 'Veículo Específico';
  };

  const th = 'px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reservas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie as reservas de veículos da sua frota</p>
        </div>
        <Link
          href="/reservas/nova"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nova Reserva
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                <th className={th}>Cliente</th>
                <th className={th}>Período</th>
                <th className={th}>Veículo</th>
                <th className={th}>Valor Estimado</th>
                <th className={th}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                      Carregando reservas...
                    </div>
                  </td>
                </tr>
              ) : reservas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CalendarRange className="h-12 w-12 text-slate-400" />
                      <span className="text-lg font-medium text-slate-900 dark:text-white">Nenhuma reserva encontrada</span>
                    </div>
                  </td>
                </tr>
              ) : (
                reservas.map((reserva) => {
                  const statusConfig = getStatusConfig(reserva.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr key={reserva._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                          <User className="h-4 w-4 text-slate-400" />
                          {getCustomerName(reserva.customerId)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <Calendar className="h-4 w-4 text-emerald-500" />
                            {formatDate(reserva.startDate)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <Calendar className="h-4 w-4 text-red-500" />
                            {formatDate(reserva.endDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <Car className="h-4 w-4 text-slate-400" />
                          {getVehicleDisplay(reserva.vehicleId)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {reserva.estimatedAmount ? formatCurrency(reserva.estimatedAmount) : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusConfig.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
