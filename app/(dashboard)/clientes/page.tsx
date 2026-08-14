'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Users, Plus, Search, Mail, Phone, MapPin, Building2, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await api.get('/customers') as any;
      setClientes(response.data || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const filteredClientes = clientes.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            Clientes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Gerencie as pessoas físicas e jurídicas cadastradas
          </p>
        </div>
        <Link 
          href="/clientes/novo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="h-5 w-5" />
          Novo Cliente
        </Link>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, documento ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Contato</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Endereço</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      Carregando clientes...
                    </div>
                  </td>
                </tr>
              ) : filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-12 w-12 text-slate-400 dark:text-slate-600" />
                      Nenhum cliente encontrado
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => (
                  <tr key={cliente._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${cliente.type === 'PJ' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                          {cliente.type === 'PJ' ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-white font-medium">{cliente.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{cliente.document}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {cliente.email && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            {cliente.email}
                          </div>
                        )}
                        {cliente.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Phone className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            {cliente.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {cliente.address?.city && cliente.address?.state ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                          {cliente.address.city} - {cliente.address.state}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        cliente.status === 'ACTIVE' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                          : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                      }`}>
                        {cliente.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
