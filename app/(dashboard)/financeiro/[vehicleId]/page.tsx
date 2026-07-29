'use client';

import { Suspense, useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { Plus, TrendingUp, TrendingDown, Wallet, Trash2, X, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/shared-utils';
import { toast } from 'sonner';

const categoryLabels: Record<string, string> = {
  SEGURO: 'Seguro',
  IPVA: 'IPVA',
  LICENCIAMENTO: 'Licenciamento',
  MULTA: 'Multa',
  MANUTENCAO: 'Manutenção',
  COMBUSTIVEL: 'Combustível',
  ALUGUEL: 'Aluguel',
  VENDA: 'Venda',
  OUTRO: 'Outro',
};

function NewEntryModal({ vehicleId, onClose }: { vehicleId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [category, setCategory] = useState('SEGURO');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/financial-entries', {
        vehicleId,
        type,
        category,
        amount: Number(amount.replace(/\./g, '').replace(',', '.')),
        date,
        description: description || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeiro', 'ledger', vehicleId] });
      toast.success('Lançamento registrado');
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Novo Lançamento</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <div className="flex gap-4">
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-3 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 has-[:checked]:border-green-600 has-[:checked]:bg-green-50 dark:has-[:checked]:bg-green-950/20">
              <input type="radio" name="type" value="INCOME" className="sr-only" checked={type === 'INCOME'} onChange={() => setType('INCOME')} />
              <div className={`h-4 w-4 rounded-full border ${type === 'INCOME' ? 'border-green-600 bg-green-600' : 'border-slate-300'}`} />
              <span className={`text-sm font-medium ${type === 'INCOME' ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>Entrada</span>
            </label>
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-3 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 has-[:checked]:border-red-600 has-[:checked]:bg-red-50 dark:has-[:checked]:bg-red-950/20">
              <input type="radio" name="type" value="EXPENSE" className="sr-only" checked={type === 'EXPENSE'} onChange={() => setType('EXPENSE')} />
              <div className={`h-4 w-4 rounded-full border ${type === 'EXPENSE' ? 'border-red-600 bg-red-600' : 'border-slate-300'}`} />
              <span className={`text-sm font-medium ${type === 'EXPENSE' ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>Saída</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Categoria</label>
            <select required value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              {Object.entries(categoryLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Valor (R$)</label>
              <input type="text" required value={amount} onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '');
                if (val) {
                  const num = parseInt(val, 10) / 100;
                  setAmount(num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                } else {
                  setAmount('');
                }
              }} placeholder="0,00"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descrição (Opcional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Óleo de motor e filtros" rows={2}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          </div>

          <button type="submit" disabled={createMutation.isPending}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {createMutation.isPending ? 'Salvando...' : 'Salvar Lançamento'}
          </button>
        </form>
      </div>
    </div>
  );
}

function VehicleLedger({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['financeiro', 'ledger', vehicleId],
    queryFn: () => api.get<any>(`/financial-entries/vehicle/${vehicleId}/ledger`),
  });

  const { data: vehicleData } = useQuery({
    queryKey: ['vehicles', vehicleId],
    queryFn: () => api.get<any>(`/vehicles/${vehicleId}`),
  });
  const vehicle = vehicleData?.data || vehicleData;

  const deleteMutation = useMutation({
    mutationFn: (sourceId: string) => api.delete(`/financial-entries/${sourceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeiro', 'ledger', vehicleId] });
      toast.success('Lançamento excluído');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const ledger = data?.data || data;
  const entries = ledger?.entries || [];

  if (isLoading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/financeiro')} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Livro Caixa</h1>
          <p className="text-sm text-slate-500">
            {vehicle ? `${vehicle.brand} ${vehicle.model} • ${vehicle.plate}` : 'Carregando veículo...'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm text-slate-500"><TrendingUp className="h-4 w-4 text-green-600" /> Entradas</div>
          <p className="mt-2 text-xl font-bold text-green-600">{formatCurrency(ledger?.totalIncome || 0)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm text-slate-500"><TrendingDown className="h-4 w-4 text-red-600" /> Saídas</div>
          <p className="mt-2 text-xl font-bold text-red-600">{formatCurrency(ledger?.totalExpense || 0)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm text-slate-500"><Wallet className="h-4 w-4 text-blue-600" /> Saldo</div>
          <p className={`mt-2 text-xl font-bold ${(ledger?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(ledger?.balance || 0)}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Novo Lançamento
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 dark:border-slate-700">
          <Wallet className="mb-4 h-12 w-12 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nenhum lançamento ainda</h3>
          <p className="mt-1 text-sm text-slate-500">Registre os pagamentos e recebimentos desse veículo</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full">
            <thead><tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Data</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Categoria</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Descrição</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Valor</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Ações</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {entries.map((e: any) => (
                <tr key={`${e.source}-${e.sourceId}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{formatDate(e.date)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{categoryLabels[e.category] || e.category}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{e.description || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      e.status === 'PENDING' 
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {e.status === 'PENDING' ? 'Pendente' : 'Pago'}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right text-sm font-medium ${e.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                    {e.type === 'INCOME' ? '+' : '-'} {formatCurrency(e.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {e.editable ? (
                      <button onClick={() => deleteMutation.mutate(e.sourceId)} className="rounded p-1 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500">automático</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <NewEntryModal vehicleId={vehicleId} onClose={() => setShowModal(false)} />}
    </div>
  );
}

export default function VehicleFinancePage(props: { params: Promise<{ vehicleId: string }> }) {
  const params = use(props.params);
  return (
    <Suspense fallback={<div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />}>
      <VehicleLedger vehicleId={params.vehicleId} />
    </Suspense>
  );
}
