'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Building2, Settings } from 'lucide-react';

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tenant', 'me'],
    queryFn: () => api.get<any>('/tenants/me'),
  });

  const [form, setForm] = useState({
    name: '',
    cnpj: '',
    contactEmail: '',
    contactPhone: '',
    zipCode: '',
    address: '',
    city: '',
  });
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  useEffect(() => {
    const tenant = data?.data || data;
    if (tenant) {
      setForm({
        name: tenant.name || '',
        cnpj: tenant.cnpj || '',
        contactEmail: tenant.contactEmail || '',
        contactPhone: tenant.contactPhone || '',
        zipCode: tenant.zipCode || '',
        address: tenant.address || '',
        city: tenant.city || '',
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: any) => api.patch('/tenants/me', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'me'] });
      toast.success('Dados da empresa atualizados!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || err.message || 'Erro ao atualizar dados da empresa'));
    },
  });

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 14);
    let masked = val;
    if (val.length > 2) masked = `${val.slice(0, 2)}.${val.slice(2)}`;
    if (val.length > 5) masked = `${val.slice(0, 2)}.${val.slice(2, 5)}.${val.slice(5)}`;
    if (val.length > 8) masked = `${val.slice(0, 2)}.${val.slice(2, 5)}.${val.slice(5, 8)}/${val.slice(8)}`;
    if (val.length > 12) masked = `${val.slice(0, 2)}.${val.slice(2, 5)}.${val.slice(5, 8)}/${val.slice(8, 12)}-${val.slice(12)}`;
    setForm({ ...form, cnpj: masked });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 11);
    let masked = val;
    if (val.length > 2) masked = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    if (val.length > 6) {
      const isCell = val.length === 11;
      const pt1 = val.slice(2, isCell ? 7 : 6);
      const pt2 = val.slice(isCell ? 7 : 6);
      masked = `(${val.slice(0, 2)}) ${pt1}-${pt2}`;
    }
    setForm({ ...form, contactPhone: masked });
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 8);
    const masked = val.replace(/(\d{5})(\d)/, '$1-$2');
    setForm((prev) => ({ ...prev, zipCode: masked }));

    if (val.length === 8) {
      setIsFetchingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
        const cepData = await res.json();
        if (!cepData.erro) {
          setForm((prev) => ({
            ...prev,
            address: `${cepData.logradouro}${cepData.bairro ? `, ${cepData.bairro}` : ''}`,
            city: `${cepData.localidade} - ${cepData.uf}`,
          }));
          toast.success('Endereço encontrado!');
        } else {
          toast.error('CEP não encontrado.');
        }
      } catch {
        toast.error('Erro ao buscar o CEP.');
      } finally {
        setIsFetchingCep(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return toast.error('O nome da empresa deve ter pelo menos 2 caracteres.');
    const rawCnpj = form.cnpj.replace(/\D/g, '');
    if (rawCnpj.length !== 14) return toast.error('O CNPJ deve ter exatos 14 dígitos.');

    mutation.mutate({
      name: form.name.trim(),
      cnpj: rawCnpj,
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone.replace(/\D/g, '') || undefined,
      zipCode: form.zipCode || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
    });
  };

  const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white";
  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Dados da empresa e preferências</p>
      </div>

      {isLoading ? (
        <div className="h-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900" noValidate>
          <div className="mb-6 flex items-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
            <Building2 className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Dados da Empresa</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass}>Nome da Empresa *</label>
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Frotly Locadora de Veículos" required />
            </div>
            <div>
              <label className={labelClass}>CNPJ *</label>
              <input className={inputClass} value={form.cnpj} onChange={handleCnpjChange} placeholder="00.000.000/0000-00" required />
            </div>
            <div>
              <label className={labelClass}>Telefone de Contato</label>
              <input className={inputClass} value={form.contactPhone} onChange={handlePhoneChange} placeholder="(41) 99999-9999" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>E-mail de Contato</label>
              <input type="email" className={inputClass} value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="contato@empresa.com" />
            </div>
          </div>

          <div className="mb-6 mt-8 border-b border-slate-200 pb-4 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Endereço</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>CEP {isFetchingCep && <span className="text-xs text-blue-500">(Buscando...)</span>}</label>
              <input className={inputClass} value={form.zipCode} onChange={handleCepChange} placeholder="Ex: 01001-000" />
            </div>
            <div>
              <label className={labelClass}>Cidade</label>
              <input className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Ex: Curitiba - PR" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Endereço Completo</label>
              <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rua, Número, Bairro" />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button type="submit" disabled={mutation.isPending}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
