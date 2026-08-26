'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const typeLabels: Record<string, string> = {
  PREVENTIVE: 'Preventiva',
  CORRECTIVE: 'Corretiva',
  INSPECTION: 'Revisão',
};

function EditMaintenanceForm({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get<any>('/vehicles', { limit: 200 }),
  });
  const vehicles = vehiclesData?.data || vehiclesData || [];

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => api.get<any>(`/maintenances/${id}`),
  });

  const [form, setForm] = useState({
    vehicleId: '',
    type: 'PREVENTIVE',
    scheduledDate: '',
    description: '',
    workshopName: '',
    workshopPhone: '',
    services: '',
    cost: 0,
    mileageAtService: undefined as number | undefined,
    nextServiceMileage: undefined as number | undefined,
    nextServiceDate: '',
    notes: '',
  });

  useEffect(() => {
    const m = data?.data || data;
    if (m) {
      setForm({
        vehicleId: m.vehicleId?._id || m.vehicleId || '',
        type: m.type || 'PREVENTIVE',
        scheduledDate: m.scheduledDate ? new Date(m.scheduledDate).toISOString().split('T')[0] : '',
        description: m.description || '',
        workshopName: m.workshopName || '',
        workshopPhone: m.workshopPhone || '',
        services: (m.services || []).join(', '),
        cost: m.cost || 0,
        mileageAtService: m.mileageAtService ?? undefined,
        nextServiceMileage: m.nextServiceMileage ?? undefined,
        nextServiceDate: m.nextServiceDate ? new Date(m.nextServiceDate).toISOString().split('T')[0] : '',
        notes: m.notes || '',
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: any) => api.put(`/maintenances/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success('Manutenção atualizada!');
      router.push(`/manutencoes/${id}`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || err.message || 'Erro ao atualizar manutenção'));
    },
  });

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setForm({ ...form, cost: Number(value) / 100 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId) return toast.error('Selecione um veículo.');
    if (!form.scheduledDate) return toast.error('Informe a data agendada.');
    if (!form.description.trim()) return toast.error('Informe uma descrição.');

    mutation.mutate({
      vehicleId: form.vehicleId,
      type: form.type,
      scheduledDate: new Date(form.scheduledDate).toISOString(),
      description: form.description,
      workshopName: form.workshopName || undefined,
      workshopPhone: form.workshopPhone || undefined,
      services: form.services ? form.services.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      cost: form.cost || undefined,
      mileageAtService: form.mileageAtService || undefined,
      nextServiceMileage: form.nextServiceMileage || undefined,
      nextServiceDate: form.nextServiceDate ? new Date(form.nextServiceDate).toISOString() : undefined,
      notes: form.notes || undefined,
    });
  };

  const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white";
  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/manutencoes/${id}`} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Editar Manutenção</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Atualize os dados da manutenção</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50" noValidate>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Veículo *</label>
            <select className={inputClass} value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required>
              <option value="">Selecione um veículo</option>
              {vehicles.map((v: any) => (
                <option key={v._id} value={v._id}>{v.licensePlate} — {v.brand} {v.model}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Tipo *</label>
            <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(typeLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Data Agendada *</label>
            <input type="date" className={inputClass} value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} required />
          </div>
          <div>
            <label className={labelClass}>Quilometragem no Serviço (km)</label>
            <input type="number" className={inputClass} value={form.mileageAtService ?? ''} onChange={(e) => setForm({ ...form, mileageAtService: e.target.value ? +e.target.value : undefined })} placeholder="Ex: 45000" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Descrição *</label>
            <input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Troca de óleo e filtros" required />
          </div>
          <div>
            <label className={labelClass}>Oficina</label>
            <input className={inputClass} value={form.workshopName} onChange={(e) => setForm({ ...form, workshopName: e.target.value })} placeholder="Ex: Auto Center Curitiba" />
          </div>
          <div>
            <label className={labelClass}>Telefone da Oficina</label>
            <input className={inputClass} value={form.workshopPhone} onChange={(e) => setForm({ ...form, workshopPhone: e.target.value })} placeholder="(41) 99999-9999" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Serviços (separados por vírgula)</label>
            <input className={inputClass} value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} placeholder="Ex: Troca de óleo, Alinhamento, Balanceamento" />
          </div>
          <div>
            <label className={labelClass}>Custo (R$)</label>
            <input
              type="text"
              className={inputClass}
              value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(form.cost || 0)}
              onChange={handleCostChange}
            />
          </div>
          <div>
            <label className={labelClass}>Próxima Manutenção — Data</label>
            <input type="date" className={inputClass} value={form.nextServiceDate} onChange={(e) => setForm({ ...form, nextServiceDate: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Próxima Manutenção — KM</label>
            <input type="number" className={inputClass} value={form.nextServiceMileage ?? ''} onChange={(e) => setForm({ ...form, nextServiceMileage: e.target.value ? +e.target.value : undefined })} placeholder="Ex: 50000" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Observações</label>
            <textarea className={inputClass} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href={`/manutencoes/${id}`} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
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

export default function EditMaintenancePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  return <EditMaintenanceForm id={params.id} />;
}
