'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api-client';

export type Role = 'SUPERADMIN' | 'ADMIN' | 'WRITE' | 'READ';

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  WRITE: 'Edição',
  READ: 'Somente leitura',
  SUPERADMIN: 'Superadmin',
};

export const ROLE_HELP: Record<string, string> = {
  ADMIN: 'Tudo, inclusive usuários, auditoria, dados da empresa e plano.',
  WRITE: 'Consulta, cadastra, edita e exclui registros da operação.',
  READ: 'Só consulta. Não altera nada.',
};

const RANK: Record<string, number> = { READ: 1, WRITE: 2, ADMIN: 3, SUPERADMIN: 4 };
const normalize = (r?: string) => (r === 'MANAGER' || r === 'VIEWER' ? 'ADMIN' : r);

/**
 * Cargo atual do usuário, lido da API (o do login pode estar desatualizado se um
 * admin mudou o cargo depois). Enquanto carrega, usa o da sessão.
 */
export function useMe() {
  const { data: session } = useSession();
  const { data } = useQuery<{ userId: string; email: string; role: Role; tenantId: string }>({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/profile'),
    enabled: !!session,
    staleTime: 60_000,
  });
  const role = normalize(data?.role ?? (session?.user as any)?.role) as Role | undefined;
  const rank = role ? RANK[role] ?? 0 : 0;
  return {
    userId: data?.userId ?? (session?.user as any)?.id,
    role,
    isAdmin: rank >= RANK.ADMIN,
    canWrite: rank >= RANK.WRITE,
    isReadOnly: role === 'READ',
    loaded: !!data,
  };
}
