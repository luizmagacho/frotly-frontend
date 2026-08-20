'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditRentalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const rentalId = resolvedParams.id;
  
  const [form, setForm] = useState({
    startDate: '', expectedEndDate: '',
    rentalAmount: '', paymentFrequency: 'WEEKLY', securityDeposit: '', notes: ''
  });

  const { data: rentalData, isLoading } = useQuery({
    queryKey: ['rental', rentalId],
    queryFn: () => api.get<any>(`/rentals/${rentalId}`),
  });

  useEffect(() => {
    if (rentalData) {
      const rental = rentalData.data || rentalData;
      setForm({
        startDate: rental.startDate ? new Date(rental.startDate).toISOString().split('T')[0] : '',
        expectedEndDate: rental.expectedEndDate ? new Date(rental.expectedEndDate).toISOString().split('T')[0] : '',
        rentalAmount: rental.rentalAmount?.toString() || '',
        paymentFrequency: rental.paymentFrequency || 'WEEKLY',
        securityDeposit: rental.securityDeposit?.toString() || '',
        notes: rental.notes || ''
      });
    }
  }, [rentalData]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: any) => api.put(`/rentals/${rentalId}`, data),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['rental', rentalId] });
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      toast.success('Contrato de aluguel atualizado!'); 
      router.push(`/alugueis/${rentalId}`); 
    },
    onError: (err: any) => toast.error(err.response?.data?.message || err.message || 'Erro ao atualizar contrato'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate || !form.rentalAmount) {
      toast.error('Preencha os campos obrigatórios!');
      return;
    }
    
    mutation.mutate({
      rentalAmount: Number(form.rentalAmount),
      securityDeposit: form.securityDeposit ? Number(form.securityDeposit) : 0,
      paymentFrequency: form.paymentFrequency,
      startDate: new Date(form.startDate).toISOString(),
      expectedEndDate: form.expectedEndDate ? new Date(form.expectedEndDate).toISOString() : undefined,
      notes: form.notes || undefined,
    });
  };

  const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white";
  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";

  if (isLoading) {
    return <div className="py-20 text-center text-slate-500 dark:text-slate-400">Carregando...</div>;
  }

  const rental = rentalData?.data || rentalData;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/alugueis/${rentalId}`} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Editar Aluguel</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Atualize os valores e datas do contrato</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Dados do Contrato</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Veículo e Motorista não podem ser alterados após o início.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Veículo</label>
            <input className={inputClass + " bg-slate-50 dark:bg-slate-800/50"} value={`${rental?.vehicleId?.brand} ${rental?.vehicleId?.model} (${rental?.vehicleId?.licensePlate})`} disabled />
          </div>
          <div>
            <label className={labelClass}>Motorista</label>
            <input className={inputClass + " bg-slate-50 dark:bg-slate-800/50"} value={rental?.driverId?.name} disabled />
          </div>
          <div>
            <label className={labelClass}>Data de Início *</label>
            <input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
          </div>
          <div>
            <label className={labelClass}>Data Prevista de Fim</label>
            <input type="date" className={inputClass} value={form.expectedEndDate} onChange={(e) => setForm({ ...form, expectedEndDate: e.target.value })} />
          </div>
        </div>

        <div className="mb-6 mt-8 border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Financeiro</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Alterar os valores ou datas vai recalcular as parcelas pendentes (as já pagas não serão afetadas).</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Valor do Aluguel (R$) *</label>
            <input type="number" step="0.01" className={inputClass} value={form.rentalAmount} onChange={(e) => setForm({ ...form, rentalAmount: e.target.value })} placeholder="Valor por período" required />
          </div>
          <div>
            <label className={labelClass}>Periodicidade do Pagamento *</label>
            <select className={inputClass} value={form.paymentFrequency} onChange={(e) => setForm({ ...form, paymentFrequency: e.target.value })} required>
              <option value="WEEKLY">Semanal</option>
              <option value="BIWEEKLY">Quinzenal</option>
              <option value="MONTHLY">Mensal</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Valor da Caução (R$)</label>
            <input type="number" step="0.01" className={inputClass} value={form.securityDeposit} onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })} placeholder="Opcional" />
          </div>
        </div>

        <div className="mb-6 mt-8 border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Informações Adicionais</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-1">
          <div className="md:col-span-1">
            <label className={labelClass}>Observações</label>
            <textarea className={inputClass} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Termos específicos do contrato..." />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Link href={`/alugueis/${rentalId}`} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
            Cancelar
          </Link>
          <button type="submit" disabled={mutation.isPending}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
