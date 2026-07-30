'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Users, Save, ArrowLeft, Building2, User } from 'lucide-react';
import Link from 'next/link';

export default function NovoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'PF' | 'PJ'>('PF');
  
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: {
      street: '',
      number: '',
      city: '',
      state: '',
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/customers', {
        type,
        ...formData
      });
      
      toast.success('Cliente cadastrado com sucesso!');
      router.push('/clientes');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Erro ao cadastrar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleMaskDocument = (val: string) => {
    // Simple mask for UI (just numbers)
    return val.replace(/\D/g, '').slice(0, type === 'PF' ? 11 : 14);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/clientes"
          className="p-2 hover:bg-slate-800 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Novo Cliente
          </h1>
          <p className="text-gray-400 mt-2">
            Cadastre um novo cliente no sistema
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Informações Principais</h2>
          
          <div className="flex gap-4 p-1 bg-slate-900 rounded-lg w-fit mb-6">
            <button
              type="button"
              onClick={() => setType('PF')}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                type === 'PF' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="h-4 w-4" />
              Pessoa Física
            </button>
            <button
              type="button"
              onClick={() => setType('PJ')}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                type === 'PJ' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Pessoa Jurídica
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                {type === 'PF' ? 'Nome Completo' : 'Razão Social'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder={type === 'PF' ? "Ex: João da Silva" : "Ex: Empresa Ltda"}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                {type === 'PF' ? 'CPF' : 'CNPJ'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.document}
                onChange={e => setFormData({...formData, document: handleMaskDocument(e.target.value)})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder={type === 'PF' ? "Apenas números" : "Apenas números"}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Endereço (Opcional)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Rua</label>
              <input
                type="text"
                value={formData.address.street}
                onChange={e => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Número</label>
              <input
                type="text"
                value={formData.address.number}
                onChange={e => setFormData({...formData, address: {...formData.address, number: e.target.value}})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Cidade</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={e => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Estado (UF)</label>
              <input
                type="text"
                maxLength={2}
                value={formData.address.state}
                onChange={e => setFormData({...formData, address: {...formData.address, state: e.target.value.toUpperCase()}})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="SP"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/clientes"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Save className="h-5 w-5" />
            )}
            Salvar Cliente
          </button>
        </div>
      </form>
    </div>
  );
}
