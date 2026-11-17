'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { FineForm } from '../fine-form';

export default function EditFinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError } = useQuery({ queryKey: ['fines', id], queryFn: () => api.get<any>(`/fines/${id}`) });

  if (isLoading) return <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />;
  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-700 dark:text-slate-300">Multa não encontrada.</p>
        <Link href="/multas" className="mt-4 inline-block text-sm font-medium text-blue-600">Voltar para Multas</Link>
      </div>
    );
  }
  return <FineForm fine={(data as any).data?._id ? (data as any).data : data} />;
}
