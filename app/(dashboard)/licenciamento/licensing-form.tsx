'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api-client';

const STATUS = [
  { value: 'PENDING', label: 'A pagar' },
  { value: 'PAID', label: 'Pago' },
  { value: 'OVERDUE', label: 'Vencido' },
];

const listOf = (res: any): any[] => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);
const toDateInput = (d?: string | Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const brl = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);

export function LicensingForm({ licensing, presetVehicleId }: { licensing?: any; presetVehicleId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!licensing?._id;
  const thisYear = new Date().getFullYear();

  const [form, setForm] = useState({
    vehicleId: licensing?.vehicleId?._id ?? licensing?.vehicleId ?? presetVehicleId ?? '',
    year: licensing?.year ?? thisYear,
    value: licensing?.value ?? 0,
    dueDate: toDateInput(licensing?.dueDate),
    status: licensing?.status ?? 'PENDING',
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const { data: vehiclesRes } = useQuery({ queryKey: ['vehicles', 'all'], queryFn: () => api.get<any>('/vehicles', { limit: 200 }) });
  const vehicles = listOf(vehiclesRes);

  const mutation = useMutation({
    mutationFn: (data: any) => (isEdit ? api.patch(`/licensing/${licensing._id}`, data) : api.post('/licensing', data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licensing'] });
      toast.success(isEdit ? 'Licenciamento atualizado.' : 'Licenciamento registrado.');
      router.push('/licenciamento');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || err.message || 'Erro ao salvar o licenciamento.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId) return toast.error('Selecione o veículo.');
    if (!form.year || form.year < 2000 || form.year > 2100) return toast.error('Informe um ano válido.');
    if (!(form.value > 0)) return toast.error('Informe o valor do licenciamento.');
    if (!form.dueDate) return toast.error('Informe o vencimento.');

    mutation.mutate({
      vehicleId: form.vehicleId,
      year: Number(form.year),
      value: form.value,
      dueDate: new Date(`${form.dueDate}T12:00:00`).toISOString(),
      status: form.status,
    });
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white';
  const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/licenciamento" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Voltar">
          <ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{isEdit ? 'Editar Licenciamento' : 'Novo Licenciamento'}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isEdit
              ? `${licensing.vehicleId?.licensePlate ?? 'Veículo'} — ${licensing.year}`
              : 'Registre o licenciamento anual (CRLV) de um veículo'}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="vehicleId" className={labelClass}>Veículo *</label>
            <select id="vehicleId" className={inputClass} value={form.vehicleId} onChange={(e) => set('vehicleId', e.target.value)}>
              <option value="">Selecione um veículo</option>
              {vehicles.map((v: any) => (
                <option key={v._id} value={v._id}>{v.licensePlate} — {v.brand} {v.model}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year" className={labelClass}>Ano de exercício *</label>
            <input
              id="year"
              type="number"
              min={2000}
              max={2100}
              className={inputClass}
              value={form.year}
              onChange={(e) => set('year', e.target.value ? Number(e.target.value) : ('' as any))}
            />
          </div>
          <div>
            <label htmlFor="value" className={labelClass}>Valor *</label>
            <input
              id="value"
              inputMode="numeric"
              className={inputClass}
              value={brl(form.value)}
              onChange={(e) => set('value', Number(e.target.value.replace(/\D/g, '')) / 100)}
            />
          </div>
          <div>
            <label htmlFor="dueDate" className={labelClass}>Vencimento *</label>
            <input id="dueDate" type="date" className={inputClass} value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>Situação</label>
            <select id="status" className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value)}>
              {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <p className="rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
          O valor entra como despesa no financeiro do veículo e acompanha a situação (a pagar ou pago).
        </p>

        <div className="flex justify-end gap-3">
          <Link href="/licenciamento" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Registrar licenciamento'}
          </button>
        </div>
      </form>
    </div>
  );
}
