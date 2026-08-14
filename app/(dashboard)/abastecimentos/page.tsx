"use client";

import { useState, useEffect } from 'react';
import { Fuel, Plus, X, Search, Calendar, MapPin, Gauge, Droplet, CreditCard, ChevronRight, DollarSign, Car } from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function RefuelsPage() {
  const [showModal, setShowModal] = useState(false);
  const [refuels, setRefuels] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [vehicleId, setVehicleId] = useState('');
  const [date, setDate] = useState('');
  const [stationName, setStationName] = useState('');
  const [fuelType, setFuelType] = useState('GASOLINE');
  const [volume, setVolume] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [currentMileage, setCurrentMileage] = useState('');
  const [isFullTank, setIsFullTank] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [refuelsRes, vehiclesRes] = await Promise.all([
        api.get<any>('/refuels'),
        api.get<any>('/vehicles')
      ]);
      setRefuels(refuelsRes.data?.data || refuelsRes.data || []);
      setVehicles(vehiclesRes.data?.data || vehiclesRes.data || []);
    } catch (error) {
      toast.error('Erro ao carregar dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setTotalCost('');
      return;
    }
    const numValue = (parseInt(rawValue, 10) / 100).toFixed(2);
    const maskedValue = numValue.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    setTotalCost(maskedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedCost = Number(totalCost.replace(/\\./g, '').replace(',', '.'));
      const parsedVolume = Number(volume);
      const parsedMileage = Number(currentMileage);
      const pricePerUnit = parsedVolume > 0 ? parsedCost / parsedVolume : 0;

      await api.post('/refuels', {
        vehicleId,
        date: new Date(date).toISOString(),
        stationName,
        fuelType,
        volume: parsedVolume,
        totalCost: parsedCost,
        pricePerUnit,
        currentMileage: parsedMileage,
        isFullTank,
        paymentMethod,
        notes
      });
      
      toast.success('Abastecimento registrado com sucesso!');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao registrar abastecimento');
    }
  };

  const resetForm = () => {
    setVehicleId('');
    setDate('');
    setStationName('');
    setFuelType('GASOLINE');
    setVolume('');
    setTotalCost('');
    setCurrentMileage('');
    setIsFullTank(false);
    setPaymentMethod('pix');
    setNotes('');
  };

  const getFuelTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'GASOLINE': 'Gasolina',
      'ETHANOL': 'Etanol',
      'DIESEL': 'Diesel',
      'CNG': 'GNV'
    };
    return types[type] || type;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Fuel className="h-6 w-6 text-orange-500" />
            Abastecimentos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie o consumo de combustível da sua frota</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Registrar Abastecimento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Gasto Total (Mês)</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(refuels.reduce((sum, r) => sum + r.totalCost, 0))}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <Droplet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Litros Abastecidos</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {refuels.reduce((sum, r) => sum + r.volume, 0).toFixed(2)} L
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <Gauge className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Registros</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {refuels.length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Histórico de Abastecimentos</h2>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Veículo</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Data</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Combustível</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Litros</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Valor Total</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Hodômetro</th>
                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Carregando dados...
                  </td>
                </tr>
              ) : refuels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Nenhum abastecimento registrado.
                  </td>
                </tr>
              ) : (
                refuels.map((refuel) => (
                  <tr key={refuel._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {refuel.vehicleId?.licensePlate}
                      </div>
                      <div className="text-xs text-slate-500">
                        {refuel.vehicleId?.brand} {refuel.vehicleId?.model}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {formatDate(refuel.date)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {getFuelTypeLabel(refuel.fuelType)}
                      </span>
                      {refuel.isFullTank && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          Tanque Cheio
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {refuel.volume} L
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {formatCurrency(refuel.totalCost)}
                      <div className="text-xs text-slate-500 font-normal">
                        {formatCurrency(refuel.pricePerUnit)}/L
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {refuel.currentMileage.toLocaleString()} km
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Fuel className="h-5 w-5 text-indigo-500" />
                Registrar Abastecimento
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Car className="h-4 w-4 text-slate-400" />
                    Veículo *
                  </label>
                  <select
                    required
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecione um veículo</option>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.licensePlate} - {v.brand} {v.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Data do Abastecimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-slate-400" />
                    Combustível *
                  </label>
                  <select
                    required
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="GASOLINE">Gasolina</option>
                    <option value="ETHANOL">Etanol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="CNG">GNV</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-slate-400" />
                    Quilometragem (KM) *
                  </label>
                  <input
                    type="number"
                    required
                    value={currentMileage}
                    onChange={(e) => setCurrentMileage(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: 45000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quantidade (Litros) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Valor Total (R$) *</label>
                  <input
                    type="text"
                    required
                    value={totalCost}
                    onChange={handleCostChange}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center h-5">
                  <input
                    id="isFullTank"
                    type="checkbox"
                    checked={isFullTank}
                    onChange={(e) => setIsFullTank(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="isFullTank" className="font-medium text-slate-700 dark:text-slate-300">
                    Tanque Cheio
                  </label>
                  <p className="text-slate-500 dark:text-slate-400">Marque se este abastecimento completou o tanque</p>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Informações Financeiras & Extras</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-slate-400" />
                      Forma de Pagamento
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="dinheiro">Dinheiro</option>
                      <option value="pix">PIX</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="fatura">Cartão Combustível / Fatura (Pendente)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      Posto / Local
                    </label>
                    <input
                      type="text"
                      value={stationName}
                      onChange={(e) => setStationName(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ex: Posto Ipiranga"
                    />
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observações (Opcional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 min-h-[80px] resize-none"
                    placeholder="Adicione qualquer detalhe relevante..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
