'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { FileText, Plus, Search, Calendar, Car, DownloadCloud, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function IpvaPage() {
  const [ipvas, setIpvas] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [totalAmount, setTotalAmount] = useState('');
  const [installments, setInstallments] = useState('1');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ipvaRes, vehiclesRes] = await Promise.all([
        api.get<any>('/ipva'),
        api.get<any>('/vehicles')
      ]);
      setIpvas(ipvaRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados de IPVA');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setTotalAmount('');
      return;
    }
    const numValue = (parseInt(rawValue, 10) / 100).toFixed(2);
    const maskedValue = numValue.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    setTotalAmount(maskedValue);
  };

  const syncDetran = async (vehicleId: string, licensePlate: string, renavam: string) => {
    try {
      toast.loading(`Sincronizando ${licensePlate} com o Detran...`, { id: `sync-${vehicleId}` });
      const res = await api.get<any>(`/detran/vehicle/${licensePlate}/${renavam}`);
      
      const ipvaInfo = res.data.ipva;
      if (ipvaInfo && ipvaInfo.totalAmount > 0) {
        // Build the creation payload based on detran info
        // Assuming we want to register it if not exists, but for now we just show a toast
        toast.success(`IPVA encontrado para ${licensePlate}: ${formatCurrency(ipvaInfo.totalAmount)}`, { id: `sync-${vehicleId}` });
        
        // Open modal pre-filled
        setSelectedVehicle(vehicleId);
        setYear(ipvaInfo.year.toString());
        // Setup amount format
        const amtStr = ipvaInfo.totalAmount.toFixed(2);
        setTotalAmount(amtStr.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
        setInstallments(ipvaInfo.totalInstallments.toString());
        setShowModal(true);
      } else {
        toast.success(`Nenhum débito de IPVA encontrado para ${licensePlate}`, { id: `sync-${vehicleId}` });
      }
    } catch (error) {
      toast.error(`Falha ao sincronizar ${licensePlate}`, { id: `sync-${vehicleId}` });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedAmount = Number(totalAmount.replace(/\./g, '').replace(',', '.'));
      const numInstallments = parseInt(installments, 10);
      const amountPerInstallment = parsedAmount / numInstallments;
      
      // Generate installments with fake dates separated by 30 days starting from next week
      const generatedInstallments = Array.from({ length: numInstallments }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + 7 + (30 * i));
        return {
          installmentNumber: i + 1,
          amount: amountPerInstallment,
          dueDate: d.toISOString(),
          status: 'PENDING'
        };
      });

      const payload = {
        vehicleId: selectedVehicle,
        year: parseInt(year, 10),
        totalAmount: parsedAmount,
        status: 'PENDING',
        installments: generatedInstallments,
      };

      await api.post('/ipva', payload);
      toast.success('IPVA registrado com sucesso!');
      setShowModal(false);
      
      // Reset form
      setSelectedVehicle('');
      setYear(new Date().getFullYear().toString());
      setTotalAmount('');
      setInstallments('1');
      
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao registrar IPVA');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400"><CheckCircle className="h-3.5 w-3.5" /> Pago</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"><Clock className="h-3.5 w-3.5" /> Pendente</span>;
      case 'OVERDUE':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400"><AlertTriangle className="h-3.5 w-3.5" /> Atrasado</span>;
      default:
        return null;
    }
  };

  // Merge vehicles with their latest IPVA for the list view
  const vehicleList = (vehicles || []).map(v => {
    const vIpvas = (ipvas || []).filter((i: any) => i && i.vehicleId && i.vehicleId._id === v._id);
    const latestIpva = vIpvas.length > 0 ? vIpvas[0] : null;
    return {
      ...v,
      latestIpva
    };
  }).filter(v => v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) || v.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">IPVA e Taxas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie os impostos e licenciamento da sua frota.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20"
          >
            <Plus className="h-4 w-4" />
            Registrar IPVA Manual
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por placa ou veículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Veículo</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Situação IPVA (Atual)</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Valor Total</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Parcelas</th>
                <th className="px-6 py-4 font-medium text-right text-slate-500 dark:text-slate-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                      Carregando...
                    </div>
                  </td>
                </tr>
              ) : vehicleList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhum veículo encontrado.
                  </td>
                </tr>
              ) : (
                vehicleList.map((v) => (
                  <tr key={v._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                          <Car className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{v.name}</p>
                          <p className="text-xs text-slate-500">{v.licensePlate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {v.latestIpva ? (
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(v.latestIpva.status)}
                          <span className="text-xs text-slate-500">Ano: {v.latestIpva.year}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Não registrado</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {v.latestIpva ? formatCurrency(v.latestIpva.totalAmount) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {v.latestIpva ? `${v.latestIpva.installments.filter((i: any) => i.status === 'PAID').length}/${v.latestIpva.installments.length}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => syncDetran(v._id, v.licensePlate, v.renavam)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <DownloadCloud className="h-3.5 w-3.5" />
                        Sincronizar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registrar IPVA</h2>
            <p className="mb-6 text-sm text-slate-500">Adicione os detalhes do imposto para o veículo.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Veículo</label>
                <select
                  required
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">Selecione um veículo</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.name} ({v.licensePlate})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Ano Referência</label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Parcelas</label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="1">Cota Única</option>
                    <option value="2">2 Parcelas</option>
                    <option value="3">3 Parcelas</option>
                    <option value="4">4 Parcelas</option>
                    <option value="5">5 Parcelas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Valor Total (R$)</label>
                <input
                  type="text"
                  required
                  value={totalAmount}
                  onChange={handleAmountChange}
                  placeholder="0,00"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Salvar IPVA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
