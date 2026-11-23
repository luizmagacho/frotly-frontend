'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-white/10 dark:bg-white/5 dark:text-white';

/** Destino do e-mail de boas-vindas: cria a senha e já entra no sistema. */
function SetPasswordForm() {
  const token = useSearchParams().get('token');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xl dark:border-white/10 dark:bg-white/5">
        <h1 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">Link inválido</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Abra o link do e-mail de convite novamente ou peça um novo ao administrador da sua locadora.</p>
        <Link href="/login" className="font-medium text-red-600 hover:text-red-500">Ir para o login</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error('A senha precisa ter pelo menos 8 caracteres.');
    if (password !== confirm) return toast.error('As senhas não coincidem.');
    setLoading(true);
    try {
      // Encerra qualquer sessão anterior neste navegador antes de tudo: senão a chamada
      // abaixo iria com o token de outra pessoa (ex.: o admin que mandou o convite).
      await signOut({ redirect: false }).catch(() => undefined);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      const res = await api.post<{ email: string; tenantId: string }>('/auth/reset-password', { token, password });
      const login = await signIn('credentials', { email: res.email, password, tenantId: res.tenantId, redirect: false });
      if (login?.error) {
        toast.success('Senha criada. Entre com seu e-mail e a nova senha.');
        router.push('/login');
        return;
      }
      toast.success('Tudo pronto! Bem-vindo(a) ao Frotly.');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message?.includes('expirado') || err?.message?.includes('inválido')
        ? 'Este link expirou ou já foi usado. Peça um novo convite ao administrador.'
        : err?.message || 'Não foi possível criar a senha.');
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-white/10 dark:bg-white/5">
      <div className="mb-8 text-center">
        <img src="/logo.jpg?v=2" alt="Frotly" className="mx-auto mb-4 h-12 w-12 rounded-xl" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Crie sua senha</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Depois disso você já entra no sistema.</p>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Senha</span>
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} required minLength={8} />
          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Mínimo de 8 caracteres.</span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar senha</span>
          <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} required minLength={8} />
        </label>
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? 'Entrando…' : 'Criar senha e entrar'}
        </button>
      </form>
    </div>
  );
}

export default function DefinirSenhaPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-900 dark:text-white">Carregando…</div>}>
      <SetPasswordForm />
    </Suspense>
  );
}
