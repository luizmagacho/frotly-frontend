'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useMe } from '@/lib/use-me';

type VehicleStatus = {
  id: string;
  plate: string;
  name: string;
  uf: string;
  problem: string | null;
  lastCheck: { at: string; ok: boolean; message?: string; summary?: { found?: number; created?: number; markedPaid?: number } } | null;
};
type DetranStatus = { enabled: boolean; supportedUfs: string[]; withoutUf: number; vehicles: VehicleStatus[] };

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });

function lastCheckText(v: VehicleStatus): string {
  if (!v.lastCheck) return 'Ainda não consultado';
  if (!v.lastCheck.ok) return `Falhou em ${fmt(v.lastCheck.at)}`;
  const s = v.lastCheck.summary ?? {};
  const parts = [`${s.found ?? 0} no Detran`];
  if (s.created) parts.push(`${s.created} nova(s)`);
  if (s.markedPaid) parts.push(`${s.markedPaid} paga(s)`);
  return `${fmt(v.lastCheck.at)} · ${parts.join(', ')}`;
}

/** Consulta automática de multas no Detran (por UF). Aparece só para locadoras com veículos de UF atendida. */
export function DetranPanel() {
  const me = useMe();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState<string | null>(null);

  const { data } = useQuery<DetranStatus>({
    queryKey: ['detran-status'],
    queryFn: () => api.get('/detran/status'),
    staleTime: 60_000,
  });

  const sync = useMutation({
    mutationFn: (id: string) => api.post<any>(`/detran/vehicles/${id}/sync`, {}),
    onMutate: (id) => setRunning(id),
    onSettled: () => setRunning(null),
    onSuccess: (res: any) => {
      const r = res?.results?.[0];
      if (r && !r.ok) toast.error(r.message || 'O Detran não respondeu. Tente mais tarde.');
      else {
        const s = r?.summary ?? {};
        toast.success(s.created ? `${s.created} multa(s) nova(s) encontrada(s).` : `Nenhuma multa nova. ${s.found ?? 0} no Detran.`);
      }
      qc.invalidateQueries({ queryKey: ['detran-status'] });
      qc.invalidateQueries({ queryKey: ['fines'] });
      qc.invalidateQueries({ queryKey: ['fines-summary'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Não foi possível consultar.');
    },
  });

  if (!data || !data.vehicles.length) return null;
  const ufs = data.supportedUfs.join(', ');

  if (!data.enabled) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
        <p className="text-slate-600 dark:text-slate-300">
          Você tem {data.vehicles.length} veículo(s) emplacado(s) no {ufs}. A Frotly pode consultar as multas, o licenciamento e o IPVA
          deles no Detran automaticamente. Fale com o suporte para ativar.
        </p>
      </div>
    );
  }

  const ready = data.vehicles.filter((v) => !v.problem);
  const last = data.vehicles.map((v) => v.lastCheck?.at).filter(Boolean).sort().pop();

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 p-4 text-left">
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900 dark:text-white">Consulta automática no Detran-{ufs}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Toda segunda-feira consultamos as multas de {ready.length} veículo(s); licenciamento e IPVA, todo dia 2.
            {last ? ` Última consulta: ${fmt(last)}.` : ''}
          </p>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
      </button>
      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.vehicles.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <Link href={`/veiculos/${v.id}`} className="font-medium text-slate-900 hover:underline dark:text-white">{v.plate}</Link>
                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{v.name}</span>
                  <p className={`text-xs ${v.problem || (v.lastCheck && !v.lastCheck.ok) ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {v.problem ?? lastCheckText(v)}
                  </p>
                </div>
                {me.isAdmin && !v.problem && (
                  <button
                    type="button"
                    data-write
                    disabled={running !== null}
                    onClick={() => sync.mutate(v.id)}
                    title="Cada consulta tem custo; dá para repetir 24 h depois."
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {running === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    Consultar agora
                  </button>
                )}
              </li>
            ))}
          </ul>
          {data.withoutUf > 0 && (
            <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              {data.withoutUf} veículo(s) sem UF de emplacamento. Preencha a UF no cadastro do veículo para incluí-lo na consulta.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
