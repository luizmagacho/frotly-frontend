'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { LicensingForm } from '../licensing-form';

export default function EditLicensingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError } = useQuery({ queryKey: ['licensing', id], queryFn: () => api.get<any>(`/licensing/${id}`) });

  if (isLoading) return <div className="mx-auto h-80 max-w-2xl animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />;
  if (isError || !data) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-700 dark:text-slate-300">Licenciamento não encontrado.</p>
        <Link href="/licenciamento" className="mt-4 inline-block text-sm font-medium text-blue-600">Voltar para Licenciamento</Link>
      </div>
    );
  }
  return <LicensingForm licensing={(data as any).data?._id ? (data as any).data : data} />;
}
