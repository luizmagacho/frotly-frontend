'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { ClipboardCheck, Plus, Search, Car, User, Gauge, MapPin, CheckCircle, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function VistoriasPage() {
  const [vistorias, setVistorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/inspections') as any;
      setVistorias(response.data || []);
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
      toast.error('Erro ao carregar vistorias');
    } finally {
      setLoading(false);
    }
  };

  const getVehicleDisplay = (vehicleId: any) => {
    if (!vehicleId) return 'Desconhecido';
    if (typeof vehicleId === 'object' && vehicleId.licensePlate) {
      return `${vehicleId.brand} ${vehicleId.model} (${vehicleId.licensePlate})`;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8 text-blue-400" />
            Checklists de Vistoria
          </h1>
          <p className="text-gray-400 mt-2">
            Registro de entrada e saída de veículos da frota
          </p>
        </div>
        <Link 
          href="/vistorias/nova"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="h-5 w-5" />
          Nova Vistoria
        </Link>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Tipo / Data</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Veículo</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Motorista</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Hodômetro</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Vistoriador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      Carregando vistorias...
                    </div>
                  </td>
                </tr>
              ) : vistorias.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardCheck className="h-12 w-12 text-gray-600" />
                      Nenhuma vistoria registrada
                    </div>
                  </td>
                </tr>
              ) : (
                vistorias.map((vistoria) => (
                  <tr key={vistoria._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border w-fit ${
                          vistoria.type === 'SAIDA'
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                            : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        }`}>
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                          {vistoria.type === 'SAIDA' ? 'Saída' : 'Devolução (Entrada)'}
                        </span>
                        <span className="text-sm text-gray-400">{formatDate(vistoria.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-white font-medium">
                        <Car className="h-4 w-4 text-gray-400" />
                        {getVehicleDisplay(vistoria.vehicleId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <User className="h-4 w-4 text-gray-400" />
                        {getDriverDisplay(vistoria.driverId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-white font-medium">
                        <Gauge className="h-4 w-4 text-blue-400" />
                        {vistoria.mileage?.toLocaleString('pt-BR')} km
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-white font-medium">{vistoria.inspectorName || '-'}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
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
