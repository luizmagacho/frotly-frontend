'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, UserCheck, UserX } from 'lucide-react';
import { api } from '@/lib/api-client';

export const AGENCIES = ['DETRAN-PR', 'PRF', 'DER-PR', 'Setran Curitiba', 'Prefeitura (trânsito municipal)', 'Outro'];
/** Pontos por gravidade no CTB: leve 3, média 4, grave 5, gravíssima 7. */
const POINTS = [
  { value: 0, label: 'Sem pontos' },
  { value: 3, label: 'Leve (3 pontos)' },
  { value: 4, label: 'Média (4 pontos)' },
  { value: 5, label: 'Grave (5 pontos)' },
  { value: 7, label: 'Gravíssima (7 pontos)' },
];
const STATUS = [
  { value: 'PENDING', label: 'A pagar' },
  { value: 'APPEALED', label: 'Em recurso' },
  { value: 'PAID', label: 'Paga' },
  { value: 'CANCELLED', label: 'Cancelada (recurso deferido)' },
];

const listOf = (res: any): any[] => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);
const toDateInput = (d?: string | Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const brl = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);

type FormState = {
  vehicleId: string;
  driverId: string;
  noticeNumber: string;
  infractionDate: string;
  description: string;
  infractionCode: string;
  location: string;
  issuingAgency: string;
  value: number;
  points: number;
  dueDate: string;
  status: string;
  driverIndicated: boolean;
  chargeToDriver: boolean;
  notes: string;
};

export function FineForm({ fine }: { fine?: any }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!fine?._id;

  const [form, setForm] = useState<FormState>({
    vehicleId: fine?.vehicleId?._id ?? fine?.vehicleId ?? '',
    driverId: fine?.driverId?._id ?? fine?.driverId ?? '',
    noticeNumber: fine?.noticeNumber ?? '',
    infractionDate: toDateInput(fine?.infractionDate),
    description: fine?.description ?? '',
    infractionCode: fine?.infractionCode ?? '',
    location: fine?.location ?? '',
    issuingAgency: fine?.issuingAgency ?? 'DETRAN-PR',
    value: fine?.value ?? 0,
    points: fine?.points ?? 0,
    dueDate: toDateInput(fine?.dueDate),
    status: fine?.status ?? 'PENDING',
    driverIndicated: fine?.driverIndicated ?? false,
    chargeToDriver: fine?.chargeToDriver ?? false,
    notes: fine?.notes ?? '',
  });
  // Depois que o usuário escolhe o motorista à mão, paramos de sobrescrever pela busca automática.
  const [driverTouched, setDriverTouched] = useState(isEdit);
  const [detected, setDetected] = useState<{ name: string } | null | undefined>(undefined);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const { data: vehiclesRes } = useQuery({ queryKey: ['vehicles', 'all'], queryFn: () => api.get<any>('/vehicles', { limit: 200 }) });
  const { data: driversRes } = useQuery({ queryKey: ['drivers', 'all'], queryFn: () => api.get<any>('/drivers', { limit: 200 }) });
  const vehicles = listOf(vehiclesRes);
  const drivers = listOf(driversRes);

  useEffect(() => {
    if (!form.vehicleId || !form.infractionDate) {
      setDetected(undefined);
      return;
    }
    let cancelled = false;
    api
      .get<any>('/fines/responsible-driver', { vehicleId: form.vehicleId, date: `${form.infractionDate}T12:00:00` })
      .then((res) => {
        if (cancelled) return;
        const driver = res?.driver ?? res?.data?.driver ?? null;
        setDetected(driver ? { name: driver.name } : null);
        if (driver && !driverTouched) setForm((f) => ({ ...f, driverId: driver.driverId }));
      })
      .catch(() => !cancelled && setDetected(undefined));
    return () => {
      cancelled = true;
    };
  }, [form.vehicleId, form.infractionDate, driverTouched]);

  const mutation = useMutation({
    mutationFn: (data: any) => (isEdit ? api.patch(`/fines/${fine._id}`, data) : api.post('/fines', data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fines'] });
      queryClient.invalidateQueries({ queryKey: ['fines-summary'] });
      toast.success(isEdit ? 'Multa atualizada.' : 'Multa registrada.');
      router.push('/multas');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || err.message || 'Erro ao salvar a multa.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId) return toast.error('Selecione o veículo.');
    if (!form.noticeNumber.trim()) return toast.error('Informe o número do auto de infração.');
    if (!form.infractionDate) return toast.error('Informe a data da infração.');
    if (!form.description.trim()) return toast.error('Descreva a infração.');
    if (!(form.value > 0)) return toast.error('Informe o valor da multa.');
    if (form.chargeToDriver && !form.driverId) return toast.error('Para repassar a multa, selecione o motorista.');

    mutation.mutate({
      vehicleId: form.vehicleId,
      driverId: form.driverId || undefined,
      noticeNumber: form.noticeNumber.trim(),
      infractionDate: new Date(`${form.infractionDate}T12:00:00`).toISOString(),
      description: form.description.trim(),
      infractionCode: form.infractionCode.trim() || undefined,
      location: form.location.trim() || undefined,
      issuingAgency: form.issuingAgency || undefined,
      value: form.value,
      points: form.points,
      dueDate: form.dueDate ? new Date(`${form.dueDate}T12:00:00`).toISOString() : undefined,
      status: form.status,
      driverIndicated: form.driverIndicated,
      chargeToDriver: form.chargeToDriver,
      notes: form.notes.trim() || undefined,
    });
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white';
  const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';
  const checkClass = 'mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/multas" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Voltar">
          <ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{isEdit ? 'Editar Multa' : 'Nova Multa'}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isEdit ? `Auto de infração ${fine.noticeNumber}` : 'Registre o auto de infração recebido'}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
      >
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="vehicleId" className={labelClass}>Veículo *</label>
            <select id="vehicleId" className={inputClass} value={form.vehicleId} onChange={(e) => set('vehicleId', e.target.value)}>
              <option value="">Selecione um veículo</option>
              {vehicles.map((v: any) => (
                <option key={v._id} value={v._id}>{v.licensePlate} — {v.brand} {v.model}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="infractionDate" className={labelClass}>Data da infração *</label>
            <input id="infractionDate" type="date" className={inputClass} value={form.infractionDate} onChange={(e) => set('infractionDate', e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="driverId" className={labelClass}>Motorista responsável</label>
            <select
              id="driverId"
              className={inputClass}
              value={form.driverId}
              onChange={(e) => {
                setDriverTouched(true);
                set('driverId', e.target.value);
              }}
            >
              <option value="">Sem motorista vinculado</option>
              {drivers.map((d: any) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
            {detected !== undefined && (
              <p className={`mt-1.5 flex items-center gap-1.5 text-xs ${detected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {detected ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                {detected
                  ? `${detected.name} estava com este veículo na data da infração (pelo contrato de aluguel).`
                  : 'Nenhum contrato de aluguel cobre este veículo nessa data.'}
              </p>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 border-t border-slate-100 pt-6 md:grid-cols-2 dark:border-slate-800">
          <div>
            <label htmlFor="noticeNumber" className={labelClass}>Nº do auto de infração (AIT) *</label>
            <input id="noticeNumber" className={inputClass} value={form.noticeNumber} onChange={(e) => set('noticeNumber', e.target.value)} placeholder="Ex: R123456789" />
          </div>
          <div>
            <label htmlFor="issuingAgency" className={labelClass}>Órgão autuador</label>
            <select id="issuingAgency" className={inputClass} value={form.issuingAgency} onChange={(e) => set('issuingAgency', e.target.value)}>
              {AGENCIES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className={labelClass}>Infração *</label>
            <input id="description" className={inputClass} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Ex: Transitar em velocidade superior à máxima permitida em até 20%" />
          </div>
          <div>
            <label htmlFor="infractionCode" className={labelClass}>Código da infração</label>
            <input id="infractionCode" className={inputClass} value={form.infractionCode} onChange={(e) => set('infractionCode', e.target.value)} placeholder="Ex: 745-50" />
          </div>
          <div>
            <label htmlFor="location" className={labelClass}>Local</label>
            <input id="location" className={inputClass} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Ex: Av. das Torres, 1500 — Curitiba" />
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
            <label htmlFor="points" className={labelClass}>Gravidade</label>
            <select id="points" className={inputClass} value={form.points} onChange={(e) => set('points', Number(e.target.value))}>
              {POINTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="dueDate" className={labelClass}>Vencimento</label>
            <input id="dueDate" type="date" className={inputClass} value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>Situação</label>
            <select id="status" className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value)}>
              {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </section>

        <section className="space-y-3 border-t border-slate-100 pt-6 dark:border-slate-800">
          <label className="flex items-start gap-3">
            <input type="checkbox" className={checkClass} checked={form.driverIndicated} onChange={(e) => set('driverIndicated', e.target.checked)} />
            <span>
              <span className="block text-sm font-medium text-slate-900 dark:text-white">Condutor indicado ao órgão</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">Os pontos vão para a CNH do motorista, não da locadora.</span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" className={checkClass} checked={form.chargeToDriver} onChange={(e) => set('chargeToDriver', e.target.checked)} />
            <span>
              <span className="block text-sm font-medium text-slate-900 dark:text-white">Repassar o valor ao motorista</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">Lança uma receita a receber do motorista no financeiro do veículo.</span>
            </span>
          </label>
        </section>

        <div>
          <label htmlFor="notes" className={labelClass}>Observações</label>
          <textarea id="notes" className={inputClass} rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/multas" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Registrar multa'}
          </button>
        </div>
      </form>
    </div>
  );
}
