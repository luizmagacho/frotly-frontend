'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Shield, Plus, X, Search, Calendar, Phone, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function InsurancePage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['insurances'],
    queryFn: () => api.get<any>('/insurances'),
  });

  const insurances = data?.data || data || [];
  
  const filteredInsurances = insurances.filter((i: any) => 
    i.vehicleId?.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
    i.vehicleId?.brand.toLowerCase().includes(search.toLowerCase()) ||
    i.vehicleId?.model.toLowerCase().includes(search.toLowerCase()) ||
    i.provider?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Seguros</h1>
          <p className="text-sm text-slate-500">Gestão de apólices e coberturas da frota</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Novo Seguro
        </button>
      </div>

      <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
        <Search className="mr-2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por placa, veículo ou seguradora..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : filteredInsurances.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 dark:border-slate-800">
          <Shield className="mb-4 h-12 w-12 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nenhum seguro encontrado</h3>
          <p className="mt-1 text-sm text-slate-500">Comece adicionando uma nova apólice para sua frota.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInsurances.map((insurance: any) => {
            const isExpired = new Date(insurance.endDate) < new Date();
            const daysToExpiry = Math.ceil((new Date(insurance.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
            const isExpiringSoon = !isExpired && daysToExpiry <= 30;

            return (
              <div key={insurance._id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {insurance.vehicleId?.brand} {insurance.vehicleId?.model}
                    </h3>
                    <p className="text-sm font-medium text-slate-500">{insurance.vehicleId?.licensePlate}</p>
                  </div>
                  {isExpired ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Vencido
                    </span>
                  ) : isExpiringSoon ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Vence em {daysToExpiry} dias
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Ativo
                    </span>
                  )}
                </div>

                <div className="mb-4 flex-1 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Seguradora</span>
                    <span className="font-medium text-slate-900 dark:text-white">{insurance.provider || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Apólice</span>
                    <span className="font-medium text-slate-900 dark:text-white">{insurance.policyNumber || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Cobertura</span>
                    <span className="font-medium text-slate-900 dark:text-white">{insurance.coverageType || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Prêmio</span>
                    <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(insurance.cost)}</span>
                  </div>
                  {insurance.installments > 1 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Parcelamento</span>
                      <span className="font-medium text-slate-900 dark:text-white">{insurance.installments}x</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Vence em {formatDate(insurance.endDate)}
                    </div>
                    {insurance.brokerPhone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-4 w-4" />
                        {insurance.brokerPhone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <NewInsuranceModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

function NewInsuranceModal({ onClose }: { onClose: () => void }) {
  const [vehicleId, setVehicleId] = useState('');
  const [provider, setProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [coverageType, setCoverageType] = useState('');
  const [brokerName, setBrokerName] = useState('');
  const [brokerPhone, setBrokerPhone] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [cost, setCost] = useState('');
  const [installments, setInstallments] = useState('1');

  const queryClient = useQueryClient();

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get<any>('/vehicles'),
  });
  const vehicles = vehiclesData?.data?.data || vehiclesData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/insurances', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurances'] });
      toast.success('Seguro registrado com sucesso');
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val) {
      const num = parseInt(val, 10) / 100;
      setCost(num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } else {
      setCost('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) {
      toast.error('Selecione um veículo');
      return;
    }
    createMutation.mutate({
      vehicleId,
      provider: provider || undefined,
      policyNumber: policyNumber || undefined,
      coverageType: coverageType || undefined,
      brokerName: brokerName || undefined,
      brokerPhone: brokerPhone || undefined,
      startDate,
      endDate,
      cost: Number(cost.replace(/\./g, '').replace(',', '.')),
      installments: Number(installments),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 pt-20">
      <div className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Registrar Novo Seguro</h3>
            <p className="text-sm text-slate-500">Preencha os dados da apólice (apenas Veículo, Vigência e Valor são obrigatórios)</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Veículo <span className="text-red-500">*</span></label>
              <select required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                <option value="">Selecione um veículo...</option>
                {vehicles.map((v: any) => (
                  <option key={v._id} value={v._id}>{v.licensePlate} - {v.brand} {v.model}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Seguradora</label>
                <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Ex: Porto Seguro"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Número da Apólice</label>
                <input type="text" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} placeholder="Ex: 123456789"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data de Início <span className="text-red-500">*</span></label>
                <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data de Vencimento <span className="text-red-500">*</span></label>
                <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Cobertura</label>
              <input type="text" value={coverageType} onChange={(e) => setCoverageType(e.target.value)} placeholder="Ex: Compreensiva, Terceiros..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Corretor / Contato</label>
                <input type="text" value={brokerName} onChange={(e) => setBrokerName(e.target.value)} placeholder="Nome do corretor"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Telefone Corretor</label>
                <input type="text" value={brokerPhone} onChange={(e) => setBrokerPhone(e.target.value)} placeholder="(11) 99999-9999"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Shield className="h-4 w-4" />
                </div>
                <h4 className="font-medium text-slate-900 dark:text-white">Integração Financeira</h4>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prêmio Total (Custo) <span className="text-red-500">*</span></label>
                  <input type="text" required value={cost} onChange={handleCostChange} placeholder="R$ 0,00"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Parcelamento em <span className="text-red-500">*</span></label>
                  <select required value={installments} onChange={(e) => setInstallments(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                      <option key={n} value={n}>{n}x {n > 1 ? 'parcelas' : 'à vista'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                O valor será automaticamente adicionado ao Livro Caixa do veículo como {installments === '1' ? 'uma despesa única' : `despesas mensais em ${installments}x`} a partir da data de início, servindo como lembretes de pagamento.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
            <button type="button" onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button type="submit" disabled={createMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {createMutation.isPending ? 'Salvando...' : 'Salvar Apólice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
