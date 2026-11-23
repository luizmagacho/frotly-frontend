'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Copy, Mail, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { api } from '@/lib/api-client';
import { ROLE_HELP, ROLE_LABELS, useMe } from '@/lib/use-me';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'WRITE' | 'READ';
  isActive: boolean;
  pendingInvite: boolean;
  inviteExpired: boolean;
  invitedAt: string | null;
  lastLoginAt: string | null;
};

type UsersResponse = { users: UserRow[]; used: number; limit: number; me: string };
type InviteResult = { emailSent: boolean; inviteLink?: string; user?: UserRow };

const ROLES = ['ADMIN', 'WRITE', 'READ'] as const;

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

function dateTime(v: string | null) {
  if (!v) return '—';
  return new Date(v).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ u }: { u: UserRow }) {
  const [label, cls] = !u.isActive
    ? ['Desativado', 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400']
    : u.pendingInvite
      ? u.inviteExpired
        ? ['Convite expirado', 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300']
        : ['Convite pendente', 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300']
      : ['Ativo', 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'];
  return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

/** Link do convite quando o e-mail não pôde ser enviado: o admin manda por outro canal. */
function LinkFallback({ link, onClose }: { link: string; onClose: () => void }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
      <p className="font-semibold">Não foi possível enviar o e-mail do convite.</p>
      <p className="mt-1">Envie este link para a pessoa (WhatsApp, por exemplo). Ele vale por 7 dias e serve para criar a senha.</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input readOnly value={link} className={`${inputCls} font-mono text-xs`} onFocus={(e) => e.currentTarget.select()} />
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(link).then(() => toast.success('Link copiado'))}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          <Copy className="h-4 w-4" /> Copiar link
        </button>
        <button type="button" onClick={onClose} className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40">
          Fechar
        </button>
      </div>
    </div>
  );
}

export default function UsuariosPage() {
  const me = useMe();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', email: '', role: 'WRITE' as UserRow['role'] });
  const [showForm, setShowForm] = useState(false);
  const [fallbackLink, setFallbackLink] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ['users'],
    queryFn: () => api.get('/users'),
    enabled: me.isAdmin,
    retry: false,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['users'] });
  const onError = (e: any) => toast.error(e?.message || 'Não foi possível concluir.');
  const afterInvite = (res: InviteResult, okMsg: string) => {
    if (res.emailSent) toast.success(okMsg);
    else if (res.inviteLink) setFallbackLink(res.inviteLink);
    refresh();
  };

  const invite = useMutation({
    mutationFn: () => api.post<InviteResult>('/users', form),
    onSuccess: (res) => {
      afterInvite(res, `Convite enviado para ${form.email}`);
      setForm({ name: '', email: '', role: 'WRITE' });
      setShowForm(false);
    },
    onError,
  });
  const resend = useMutation({
    mutationFn: (u: UserRow) => api.post<InviteResult>(`/users/${u.id}/resend-invite`),
    onSuccess: (res, u) => afterInvite(res, `Convite reenviado para ${u.email}`),
    onError,
  });
  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => api.patch(`/users/${id}/role`, { role }),
    onSuccess: () => {
      toast.success('Cargo atualizado');
      refresh();
    },
    onError: (e) => {
      onError(e);
      refresh();
    },
  });
  const setActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => api.patch(`/users/${id}/${active ? 'reactivate' : 'deactivate'}`),
    onSuccess: (_r, v) => {
      toast.success(v.active ? 'Usuário reativado' : 'Usuário desativado. O acesso dele foi encerrado.');
      setConfirming(null);
      refresh();
    },
    onError,
  });

  if (me.loaded && !me.isAdmin) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Apenas administradores podem gerenciar usuários.</p>;
  }

  const full = !!data && data.used >= data.limit;
  const busy = invite.isPending || resend.isPending || changeRole.isPending || setActive.isPending;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Usuários</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quem acessa o sistema da sua locadora e o que cada pessoa pode fazer. Todos veem os mesmos veículos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          disabled={full}
          title={full ? 'Limite de usuários atingido' : undefined}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UserPlus className="h-4 w-4" /> Convidar usuário
        </button>
      </div>

      {data && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
              <Users className="h-4 w-4" /> {data.used} de {data.limit} usuários ativos
            </span>
            {full && <span className="text-xs text-slate-500 dark:text-slate-400">Desative alguém para liberar uma vaga.</span>}
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className={`h-full rounded-full ${full ? 'bg-amber-500' : 'bg-red-600'}`} style={{ width: `${Math.min(100, (data.used / data.limit) * 100)}%` }} />
          </div>
        </div>
      )}

      {fallbackLink && <LinkFallback link={fallbackLink} onClose={() => setFallbackLink(null)} />}

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            invite.mutate();
          }}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nome</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Nome completo" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</span>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="pessoa@empresa.com.br" />
            </label>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Cargo</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {ROLES.map((r) => (
                <label
                  key={r}
                  className={`cursor-pointer rounded-lg border p-3 text-sm ${
                    form.role === r
                      ? 'border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                  }`}
                >
                  <input type="radio" name="role" value={r} checked={form.role === r} onChange={() => setForm({ ...form, role: r })} className="sr-only" />
                  <span className="block font-semibold text-slate-900 dark:text-white">{ROLE_LABELS[r]}</span>
                  <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{ROLE_HELP[r]}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5" /> A pessoa recebe um e-mail de boas-vindas para criar a senha (link válido por 7 dias).
            </p>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                Cancelar
              </button>
              <button type="submit" disabled={invite.isPending} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {invite.isPending ? 'Enviando…' : 'Enviar convite'}
              </button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      ) : error ? (
        <p className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800">Não foi possível carregar os usuários.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                <th className="px-4 py-3">Usuário</th>
                <th className="px-4 py-3">Cargo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Último acesso</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {data?.users.map((u) => {
                const self = u.id === data.me;
                return (
                  <tr key={u.id} className={u.isActive ? '' : 'opacity-60'}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {u.name} {self && <span className="text-xs font-normal text-slate-400">(você)</span>}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={`Cargo de ${u.name}`}
                        value={u.role}
                        disabled={self || !u.isActive || busy}
                        title={self ? 'Você não pode mudar o próprio cargo' : undefined}
                        onChange={(e) => changeRole.mutate({ id: u.id, role: e.target.value })}
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge u={u} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                      {u.pendingInvite ? `Convidado em ${dateTime(u.invitedAt).split(' ')[0]}` : dateTime(u.lastLoginAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {u.isActive && u.pendingInvite && (
                          <button type="button" disabled={busy} onClick={() => resend.mutate(u)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-800">
                            Reenviar convite
                          </button>
                        )}
                        {!self &&
                          (u.isActive ? (
                            confirming === u.id ? (
                              <>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Encerrar o acesso?</span>
                                <button type="button" disabled={busy} onClick={() => setActive.mutate({ id: u.id, active: false })} className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                                  Desativar
                                </button>
                                <button type="button" onClick={() => setConfirming(null)} className="rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <button type="button" onClick={() => setConfirming(u.id)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40">
                                Desativar
                              </button>
                            )
                          ) : (
                            <button type="button" disabled={busy || full} title={full ? 'Limite de usuários atingido' : undefined} onClick={() => setActive.mutate({ id: u.id, active: true })} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40">
                              Reativar
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {ROLES.map((r) => (
          <div key={r} className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <ShieldCheck className="h-4 w-4 text-red-600" /> {ROLE_LABELS[r]}
            </div>
            <p className="mt-1 text-slate-500 dark:text-slate-400">{ROLE_HELP[r]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
