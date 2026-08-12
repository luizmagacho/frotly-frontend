'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, FileText, CheckCircle, XCircle, AlertTriangle, Eye, Car } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/shared-utils';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INACTIVE: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  SUSPENDED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusLabel: Record<string, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  SUSPENDED: 'Suspenso',
};

const rentalStatusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  OVERDUE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const rentalStatusLabel: Record<string, string> = {
  ACTIVE: 'Ativo',
  COMPLETED: 'Encerrado',
  OVERDUE: 'Atrasado',
  CANCELLED: 'Cancelado',
};

export default function DriverDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const driverId = resolvedParams.id;

  const { data: driverData, isLoading: isLoadingDriver, error: driverError } = useQuery({
    queryKey: ['driver', driverId],
    queryFn: () => api.get<any>(`/drivers/${driverId}`),
  });

  const { data: rentalsData, isLoading: isLoadingRentals } = useQuery({
    queryKey: ['driverRentals', driverId],
    queryFn: () => api.get<any>(`/rentals/by-driver/${driverId}`),
  });

  if (isLoadingDriver) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (driverError || !driverData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Motorista não encontrado</h2>
        <p className="mt-2 text-slate-500">O motorista que você está procurando não existe ou foi removido.</p>
        <button onClick={() => router.back()} className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Voltar
        </button>
      </div>
    );
  }

  const driver = driverData.data || driverData;
  const rentals = rentalsData?.data?.data || rentalsData?.data || rentalsData || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/motoristas')}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Detalhes do Motorista
              </h1>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[driver.status] || ''}`}>
                {statusLabel[driver.status] || driver.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cadastrado em {formatDate(driver.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Info Cards */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <User className="h-5 w-5 text-blue-500" />
              Dados Pessoais
            </h3>
            <div className="space-y-3 text-sm">
              <p className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Nome:</span>
                <span className="font-medium text-slate-900 dark:text-white">{driver.name}</span>
              </p>
              <p className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">CPF:</span>
                <span className="font-medium text-slate-900 dark:text-white">{driver.cpf}</span>
              </p>
              <p className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">E-mail:</span>
                <span className="font-medium text-slate-900 dark:text-white">{driver.email}</span>
              </p>
              <p className="flex justify-between pb-1">
                <span className="text-slate-500 dark:text-slate-400">Telefone:</span>
                <span className="font-medium text-slate-900 dark:text-white">{driver.phone}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <FileText className="h-5 w-5 text-blue-500" />
              Documentação (CNH)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">Número da CNH</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{driver.licenseNumber}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">Categoria</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{driver.licenseCategory}</p>
              </div>
              <div className="col-span-2 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">Vencimento da CNH</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="font-semibold text-slate-900 dark:text-white">{formatDate(driver.licenseExpiration)}</p>
                  {new Date(driver.licenseExpiration) < new Date() ? (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">Vencida</span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Regular</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rentals List */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <Car className="h-5 w-5 text-blue-500" />
          Histórico de Aluguéis ({rentals.length})
        </h3>
        
        {isLoadingRentals ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : rentals.length > 0 ? (
          <div className="space-y-3">
            {rentals.map((rental: any) => (
              <Link 
                key={rental._id} 
                href={`/alugueis/${rental._id}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
                    <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {rental.vehicleId?.plate || rental.vehicleId?.licensePlate || 'Veículo Excluído'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Início: {formatDate(rental.startDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-slate-900 dark:text-white">{formatCurrency(rental.rentalAmount)}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${rentalStatusColors[rental.status] || ''}`}>
                      {rentalStatusLabel[rental.status] || rental.status}
                    </span>
                  </div>
                  <Eye className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">Este motorista não possui nenhum aluguel registrado.</p>
        )}
      </div>
    </div>
  );
}
