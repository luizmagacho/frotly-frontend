'use client';

import { useState, useEffect, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  FileText,
  Car,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/shared-utils';

const statusColors: Record<string, string> = {
  ATIVO: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ENCERRADO: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  PENDENTE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  CANCELADO: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

const paymentStatusLabel: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  OVERDUE: 'Atrasado',
};

export default function RentalDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resolvedParams = use(params);
  const rentalId = resolvedParams.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['rental', rentalId],
    queryFn: () => api.get<any>(`/rentals/${rentalId}`),
  });

  const terminateMutation = useMutation({
    mutationFn: () => api.post(`/rentals/${rentalId}/terminate`, {}),
    onSuccess: () => {
      toast.success('Aluguel encerrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['rental', rentalId] });
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
    },
    onError: () => {
      toast.error('Erro ao encerrar aluguel.');
    }
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (paymentId: string) => api.post(`/rentals/${rentalId}/payments`, {
      paymentId,
      paidAt: new Date().toISOString(),
      paymentMethod: 'PIX', // default for now
    }),
    onSuccess: () => {
      toast.success('Pagamento registrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['rental', rentalId] });
    },
    onError: () => {
      toast.error('Erro ao registrar pagamento.');
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Aluguel não encontrado</h2>
        <p className="mt-2 text-slate-500">O contrato que você está procurando não existe ou foi removido.</p>
        <button onClick={() => router.back()} className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Voltar
        </button>
      </div>
    );
  }

  const rental = data.data;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/alugueis')}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Detalhes do Aluguel
              </h1>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[rental.status] || ''}`}>
                {rental.status}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Contrato registrado em {formatDate(rental.createdAt)}
            </p>
          </div>
        </div>

        {rental.status === 'ATIVO' && (
          <button
            onClick={() => {
              if (window.confirm('Tem certeza que deseja encerrar este contrato de aluguel? O veículo ficará disponível novamente.')) {
                terminateMutation.mutate();
              }
            }}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            disabled={terminateMutation.isPending}
          >
            {terminateMutation.isPending ? 'Encerrando...' : 'Encerrar Contrato'}
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Info Cards */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <User className="h-5 w-5 text-blue-500" />
              Motorista Responsável
            </h3>
            <div className="space-y-3 text-sm">
              <p className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-slate-500">Nome:</span>
                <span className="font-medium text-slate-900 dark:text-white">{rental.driverId?.name}</span>
              </p>
              <p className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-slate-500">CPF:</span>
                <span className="font-medium text-slate-900 dark:text-white">{rental.driverId?.cpf}</span>
              </p>
              <p className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-slate-500">Telefone:</span>
                <span className="font-medium text-slate-900 dark:text-white">{rental.driverId?.phone}</span>
              </p>
              <p className="flex justify-between pb-1">
                <span className="text-slate-500">CNH:</span>
                <span className="font-medium text-slate-900 dark:text-white">{rental.driverId?.licenseNumber}</span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <Car className="h-5 w-5 text-blue-500" />
              Veículo Alugado
            </h3>
            <div className="space-y-3 text-sm">
              <p className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-slate-500">Placa:</span>
                <span className="font-medium text-slate-900 dark:text-white">{rental.vehicleId?.licensePlate}</span>
              </p>
              <p className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-slate-500">Veículo:</span>
                <span className="font-medium text-slate-900 dark:text-white">{rental.vehicleId?.brand} {rental.vehicleId?.model}</span>
              </p>
              <p className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-slate-500">Cor:</span>
                <span className="font-medium text-slate-900 dark:text-white">{rental.vehicleId?.color}</span>
              </p>
              <p className="flex justify-between pb-1">
                <span className="text-slate-500">Ano:</span>
                <span className="font-medium text-slate-900 dark:text-white">{rental.vehicleId?.year}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Contract & Payments */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <FileText className="h-5 w-5 text-blue-500" />
              Dados do Contrato
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500">Data de Início</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{formatDate(rental.startDate)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500">Data Fim Prevista</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {rental.expectedEndDate ? formatDate(rental.expectedEndDate) : 'Indeterminado'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500">Valor Acordado</p>
                <p className="mt-1 font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(rental.rentalAmount)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500">Periodicidade</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{rental.paymentFrequency}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <Receipt className="h-5 w-5 text-blue-500" />
              Parcelas ({rental.payments?.length || 0})
            </h3>
            
            {rental.payments && rental.payments.length > 0 ? (
              <div className="max-h-64 space-y-3 overflow-y-auto pr-2">
                {rental.payments.map((payment: any, index: number) => (
                  <div key={payment._id || index} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Parcela {index + 1} • {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Vencimento: {formatDate(payment.dueDate)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${paymentStatusColors[payment.status] || ''}`}>
                        {paymentStatusLabel[payment.status] || payment.status}
                      </span>
                      
                      {payment.status !== 'PAID' && rental.status === 'ATIVO' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Confirmar o recebimento desta parcela?')) {
                              recordPaymentMutation.mutate(payment._id);
                            }
                          }}
                          disabled={recordPaymentMutation.isPending}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Marcar como Pago
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Nenhuma parcela gerada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
