'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewDriverPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', cpf: '', rg: '', cnhNumber: '', cnhCategory: '',
    licenseExpiration: '', phone: '', email: '',
    address: '', city: '', zipCode: '', notes: '', status: 'ACTIVE'
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/drivers', data),
    onSuccess: () => { toast.success('Motorista cadastrado!'); router.push('/motoristas'); },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || err.message || 'Erro ao cadastrar motorista'));
    },
  });

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    const masked = val.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2');
    setForm({ ...form, cpf: masked });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    let masked = val;
    if (val.length > 2) masked = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    if (val.length > 6) {
      const isCell = val.length === 11;
      const pt1 = val.slice(2, isCell ? 7 : 6);
      const pt2 = val.slice(isCell ? 7 : 6);
      masked = `(${val.slice(0, 2)}) ${pt1}-${pt2}`;
    }
    setForm({ ...form, phone: masked });
  };

  const handleCnhChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, cnhNumber: e.target.value.replace(/\D/g, '').slice(0, 11) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return toast.error('O Nome deve ter pelo menos 2 caracteres.');
    const rawCpf = form.cpf.replace(/\D/g, '');
    if (rawCpf.length !== 11) return toast.error('O CPF deve ter exatos 11 dígitos.');
    if (form.cnhNumber.length < 9) return toast.error('O número da CNH deve ter entre 9 e 11 dígitos.');
    const rawPhone = form.phone.replace(/\D/g, '');
    if (rawPhone.length < 10) return toast.error('O telefone deve ter pelo menos 10 dígitos (com DDD).');
    if (!form.email || !form.email.includes('@')) return toast.error('E-mail inválido.');
    if (!form.cnhCategory) return toast.error('A categoria da CNH é obrigatória.');
    if (!form.licenseExpiration) return toast.error('A data de validade da CNH é obrigatória.');

    mutation.mutate({
      name: form.name,
      cpf: rawCpf,
      licenseNumber: form.cnhNumber,
      licenseCategory: form.cnhCategory,
      licenseExpiration: new Date(form.licenseExpiration).toISOString(),
      phone: rawPhone,
      email: form.email,
      address: form.address || undefined,
      city: form.city || undefined,
      zipCode: form.zipCode || undefined,
      notes: form.notes || undefined,
      status: form.status || 'ACTIVE',
    });
  };

  const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white";
  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/motoristas" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Novo Motorista</h1>
          <p className="text-sm text-slate-500">Cadastre um novo motorista no sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Dados Pessoais</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>Nome Completo *</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: João da Silva" required />
          </div>
          <div>
            <label className={labelClass}>CPF *</label>
            <input className={inputClass} value={form.cpf} onChange={handleCpfChange} placeholder="Ex: 123.456.789-01" required />
          </div>
          <div>
            <label className={labelClass}>RG</label>
            <input className={inputClass} value={form.rg} onChange={(e) => setForm({ ...form, rg: e.target.value })} placeholder="Opcional" />
          </div>
          <div>
            <label className={labelClass}>Telefone *</label>
            <input className={inputClass} value={form.phone} onChange={handlePhoneChange} placeholder="Ex: (11) 99999-9999" required />
          </div>
          <div>
            <label className={labelClass}>E-mail *</label>
            <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="joao@email.com" required />
          </div>
        </div>

        <div className="mb-6 mt-8 border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Habilitação (CNH)</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <label className={labelClass}>Número da CNH *</label>
            <input className={inputClass} value={form.cnhNumber} onChange={handleCnhChange} placeholder="Somente números" required />
          </div>
          <div>
            <label className={labelClass}>Categoria *</label>
            <input className={inputClass} value={form.cnhCategory} onChange={(e) => setForm({ ...form, cnhCategory: e.target.value.toUpperCase() })} placeholder="Ex: B, AB" required />
          </div>
          <div>
            <label className={labelClass}>Validade *</label>
            <input type="date" className={inputClass} value={form.licenseExpiration} onChange={(e) => setForm({ ...form, licenseExpiration: e.target.value })} required />
          </div>
        </div>

        <div className="mb-6 mt-8 border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Endereço</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>CEP</label>
            <input className={inputClass} value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} placeholder="Somente números" />
          </div>
          <div>
            <label className={labelClass}>Cidade</label>
            <input className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Ex: São Paulo" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Endereço Completo</label>
            <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rua, Número, Bairro" />
          </div>
        </div>

        <div className="mb-6 mt-8 border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Informações Adicionais</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
              <option value="SUSPENDED">Suspenso</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Observações</label>
            <textarea className={inputClass} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Link href="/motoristas" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
            Cancelar
          </Link>
          <button type="submit" disabled={mutation.isPending}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {mutation.isPending ? 'Salvando...' : 'Salvar Motorista'}
          </button>
        </div>
      </form>
    </div>
  );
}
