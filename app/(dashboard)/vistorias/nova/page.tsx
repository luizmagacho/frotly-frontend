'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { ClipboardCheck, Save, ArrowLeft, Car, Fuel, Gauge, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function NovaVistoriaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locacoes, setLocacoes] = useState<any[]>([]); // We need rentals to tie the inspection to a rental
  const [veiculos, setVeiculos] = useState<any[]>([]); 
  const [motoristas, setMotoristas] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    rentalId: '',
    vehicleId: '',
    driverId: '',
    type: 'SAIDA',
    mileage: '',
    fuelLevel: 'CHEIO',
    observations: '',
    inspectorName: '',
  });

  const [damages, setDamages] = useState<{location: string, description: string}[]>([]);

  useEffect(() => {
    // Fetch data for selects
    const loadData = async () => {
      try {
        const [veiculosRes, motoristasRes] = await Promise.all([
          api.get('/vehicles'),
          api.get('/drivers')
        ]);
        setVeiculos(veiculosRes.data || []);
        setMotoristas(motoristasRes.data || []);
      } catch (error) {
        toast.error('Erro ao carregar dados do formulário');
      }
    };
    loadData();
  }, []);

  const addDamage = () => {
    setDamages([...damages, { location: '', description: '' }]);
  };

  const removeDamage = (index: number) => {
    setDamages(damages.filter((_, i) => i !== index));
  };

  const updateDamage = (index: number, field: 'location' | 'description', value: string) => {
    const newDamages = [...damages];
    newDamages[index][field] = value;
    setDamages(newDamages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        ...formData,
        mileage: parseInt(formData.mileage),
        damages
      };
      
      // se nao tiver rentalId (porque nao implementamos a selecao de locacao ainda no front, vamos passar um mock provisorio ou deixar sem se o backend permitir, mas o backend exige)
      // Como o Schema exige rentalId, precisamos enviar um valido, ou um fake provisorio se o usuario nao tiver
      // Por simplicidade, caso a api falhe, mostramos toast
      await api.post('/inspections', payload);
      
      toast.success('Vistoria salva com sucesso!');
      router.push('/vistorias');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar vistoria. Verifique se informou todos os campos obrigatórios (Veículo, Motorista e Locação).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/vistorias"
          className="p-2 hover:bg-slate-800 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Novo Checklist de Vistoria
          </h1>
          <p className="text-gray-400 mt-2">
            Registre as condições do veículo na saída ou devolução
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Bloco Principal */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Dados da Movimentação</h2>
          
          <div className="flex gap-4 p-1 bg-slate-900 rounded-lg w-fit mb-6">
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'SAIDA'})}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                formData.type === 'SAIDA' 
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Vistoria de Saída
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'ENTRADA'})}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                formData.type === 'ENTRADA' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Vistoria de Devolução
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Veículo <span className="text-red-500">*</span></label>
              <select
                required
                value={formData.vehicleId}
                onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o veículo...</option>
                {veiculos.map(v => (
                  <option key={v._id} value={v._id}>{v.brand} {v.model} - {v.licensePlate}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Motorista Responsável <span className="text-red-500">*</span></label>
              <select
                required
                value={formData.driverId}
                onChange={e => setFormData({...formData, driverId: e.target.value})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o motorista...</option>
                {motoristas.map(m => (
                  <option key={m._id} value={m._id}>{m.name} ({m.cpf})</option>
                ))}
              </select>
            </div>
            
            {/* Como mock, para não bloquear o usuario, inserimos um campo onde ele apenas informa a Locação, mas o correto num sistema maior seria puxar da tabela de locações. Como RentalId é ID, deixaremos livre com a ressalva. */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-300">ID do Contrato de Locação <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.rentalId}
                onChange={e => setFormData({...formData, rentalId: e.target.value})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 66a6a5ba90072ecfb051ccec"
              />
              <p className="text-xs text-gray-500">Cole o ObjectId do contrato de locação correspondente.</p>
            </div>
          </div>
        </div>

        {/* Bloco de Condições */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Condições Atuais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Gauge className="h-4 w-4 text-blue-400" /> Hodômetro Atual (KM) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.mileage}
                onChange={e => setFormData({...formData, mileage: e.target.value})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 45000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Fuel className="h-4 w-4 text-emerald-400" /> Nível de Combustível <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.fuelLevel}
                onChange={e => setFormData({...formData, fuelLevel: e.target.value})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="VAZIO">Vazio</option>
                <option value="1/4">1/4 de Tanque</option>
                <option value="1/2">Meio Tanque</option>
                <option value="3/4">3/4 de Tanque</option>
                <option value="CHEIO">Cheio</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bloco de Avarias */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Avarias Encontradas
            </h2>
            <button
              type="button"
              onClick={addDamage}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Adicionar Avaria
            </button>
          </div>
          
          {damages.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-700 rounded-lg">
              <p className="text-gray-400">Nenhuma avaria registrada neste veículo.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {damages.map((dmg, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
                  <div className="flex-1 space-y-4">
                    <input
                      type="text"
                      placeholder="Local (Ex: Para-choque dianteiro)"
                      value={dmg.location}
                      onChange={e => updateDamage(index, 'location', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Descrição (Ex: Risco profundo)"
                      value={dmg.description}
                      onChange={e => updateDamage(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDamage(index)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bloco Final */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Observações Gerais</label>
              <textarea
                value={formData.observations}
                onChange={e => setFormData({...formData, observations: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Qualquer outra informação relevante..."
              />
            </div>
            
            <div className="space-y-2 md:w-1/2">
              <label className="text-sm font-medium text-gray-300">Nome do Vistoriador <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.inspectorName}
                onChange={e => setFormData({...formData, inspectorName: e.target.value})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Seu nome"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/vistorias"
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
            Concluir Vistoria
          </button>
        </div>
      </form>
    </div>
  );
}
