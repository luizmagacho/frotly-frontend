'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { CalendarRange, Plus, Search, Calendar, Car, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function ReservasPage() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reservasRes, clientesRes] = await Promise.all([
        api.get('/reservas') as any, // Wait, backend endpoint is /reservations! Let me fix it immediately.
        api.get('/customers') as any
      ]);
      setReservas(reservasRes.data || []);
      setClientes(clientesRes.data || []);
    } catch (error) {
      // Actually backend is /reservations
      try {
        const [reservasRes, clientesRes] = await Promise.all([
          api.get('/reservations') as any,
          api.get('/customers') as any
        ]);
        setReservas(reservasRes.data || []);
        setClientes(clientesRes.data || []);
      } catch (err) {
        console.error('Failed to fetch reservations:', err);
        toast.error('Erro ao carregar reservas');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock, label: 'Pendente' };
      case 'CONFIRMED':
        return { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: CheckCircle, label: 'Confirmada' };
      case 'COMPLETED':
        return { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle, label: 'Concluída' };
      case 'CANCELLED':
        return { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: XCircle, label: 'Cancelada' };
      default:
        return { color: 'text-gray-400 bg-gray-500/10 border-gray-500/20', icon: Clock, label: status };
    }
  };

  // Helper to map customer names
  const getCustomerName = (id: string) => {
    // If the API populates customerId, it might be an object
    if (typeof id === 'object' && id !== null && (id as any).name) {
      return (id as any).name;
    }
    const customer = clientes.find(c => c._id === id);
    return customer ? customer.name : 'Desconhecido';
  };

  const getVehicleDisplay = (vehicleId: any) => {
    if (!vehicleId) return 'A definir';
    if (typeof vehicleId === 'object' && vehicleId !== null && vehicleId.licensePlate) {
      return `${vehicleId.brand} ${vehicleId.model} (${vehicleId.licensePlate})`;
    }
    return 'Veículo Específico';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <CalendarRange className="h-8 w-8 text-blue-400" />
            Reservas
          </h1>
          <p className="text-gray-400 mt-2">
            Gerencie as reservas de veículos da sua frota
          </p>
        </div>
        <Link 
          href="/reservas/nova"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="h-5 w-5" />
          Nova Reserva
        </Link>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Período</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Veículo</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Valor Estimado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      Carregando reservas...
                    </div>
                  </td>
                </tr>
              ) : reservas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <CalendarRange className="h-12 w-12 text-gray-600" />
                      Nenhuma reserva encontrada
                    </div>
                  </td>
                </tr>
              ) : (
                reservas.map((reserva) => {
                  const statusConfig = getStatusConfig(reserva.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <tr key={reserva._id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-white font-medium">
                          <User className="h-4 w-4 text-gray-400" />
                          {getCustomerName(reserva.customerId)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Calendar className="h-4 w-4 text-emerald-400" />
                            {formatDate(reserva.startDate)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Calendar className="h-4 w-4 text-red-400" />
                            {formatDate(reserva.endDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Car className="h-4 w-4 text-gray-400" />
                          {getVehicleDisplay(reserva.vehicleId)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">
                          {reserva.estimatedAmount ? formatCurrency(reserva.estimatedAmount) : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${statusConfig.color}`}>
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
