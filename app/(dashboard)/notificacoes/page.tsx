'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDate } from '@/lib/shared-utils';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<any>('/notifications'),
  });
  const notifications = data?.data || data || [];
  const hasUnread = notifications.some((n: any) => !n.isRead);

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notificações</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Central de alertas</p>
        </div>
        {hasUnread && (
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 dark:border-slate-700">
          <Bell className="mb-4 h-12 w-12 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nenhuma notificação</h3>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <button
              key={n._id}
              onClick={() => !n.isRead && markAsReadMutation.mutate(n._id)}
              className={`w-full rounded-lg border p-4 text-left transition-colors ${
                n.isRead
                  ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                  : 'border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:hover:bg-blue-900/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">{n.title}</h4>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{n.message}</p>
                </div>
                {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
              </div>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{formatDate(n.createdAt)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
