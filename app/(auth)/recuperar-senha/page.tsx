'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm text-center">
        <h1 className="mb-4 text-2xl font-bold text-white">Link Inválido</h1>
        <p className="mb-6 text-sm text-slate-400">O link de recuperação está ausente ou é inválido.</p>
        <Link href="/esqueci-senha" className="text-blue-400 hover:text-blue-300">Solicitar novo link</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm text-center">
        <div className="mb-4 rounded-lg bg-green-500/10 p-4 text-sm text-green-400">
          Senha redefinida com sucesso!
        </div>
        <Link href="/login" className="text-blue-400 hover:text-blue-300">Ir para o Login</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Senha atualizada com sucesso');
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (error: any) {
      toast.error(error.message || 'Falha ao redefinir senha. O link pode ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">Nova Senha</h1>
        <p className="mt-2 text-sm text-slate-400">Crie uma nova senha para sua conta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Nova Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required minLength={6} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Confirmar Nova Senha</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required minLength={6} />
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? 'Salvando...' : 'Salvar Nova Senha'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-white text-center">Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
