'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { CalendarRange, Save, ArrowLeft, User, Car, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function NovaReservaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    startDate: '',
    endDate: '',
    estimatedAmount: '',
  });

  useEffect(() => {
    // Fetch clients and vehicles for the selects
    const loadData = async () => {
      try {
        const [clientesRes, veiculosRes] = await Promise.all([
          api.get('/customers'),
          api.get('/vehicles')
        ]);
        setClientes(clientesRes.data || []);
        setVeiculos(veiculosRes.data || []);
      } catch (error) {
        toast.error('Erro ao carregar dados para o formulário');
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        customerId: formData.customerId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };
      
      if (formData.vehicleId) {
        payload.vehicleId = formData.vehicleId;
      }
      
      if (formData.estimatedAmount) {
        payload.estimatedAmount = parseFloat(formData.estimatedAmount);
      }

      await api.post('/reservations', payload);
      
      toast.success('Reserva criada com sucesso!');
      router.push('/reservas');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/reservas"
          className="p-2 hover:bg-slate-800 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Nova Reserva
          </h1>
          <p className="text-gray-400 mt-2">
            Agende uma locação para um cliente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <User className="h-4 w-4" /> Cliente <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.customerId}
                onChange={e => setFormData({...formData, customerId: e.target.value})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um cliente...</option>
                {clientes.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.document})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Car className="h-4 w-4" /> Veículo Específico (Opcional)
              </label>
              <select
                value={formData.vehicleId}
                onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Qualquer veículo da categoria...</option>
                {veiculos.map(v => (
                  <option key={v._id} value={v._id}>{v.brand} {v.model} - {v.licensePlate}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Data de Início <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Data de Término <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-300">Valor Estimado (Opcional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.estimatedAmount}
                  onChange={e => setFormData({...formData, estimatedAmount: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/reservas"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Save className="h-5 w-5" />
            )}
            Criar Reserva
          </button>
        </div>
      </form>
    </div>
  );
}
