'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api-client';

/**
 * Marca cada conversa do chat (Crisp) com a origem do contato, para que quem
 * atende — no painel do Crisp ou no e-mail de notificação — saiba de imediato
 * que o cliente veio do Frotly (e não de outro produto, como o Kivoni), em qual
 * página estava e, se logado, quem é e de qual locadora.
 *
 * A Crisp aceita comandos enfileirados em window.$crisp antes mesmo do script
 * terminar de carregar, então basta dar push aqui.
 */
type CrispQueue = unknown[][];

function crisp(...cmd: unknown[]) {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { $crisp?: CrispQueue };
  w.$crisp = w.$crisp || [];
  w.$crisp.push(cmd);
}

const PRODUCT = 'Frotly';

export function CrispIdentity() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const identifiedFor = useRef<string | null>(null);

  // Origem fixa do produto + página atual (atualizada a cada navegação).
  useEffect(() => {
    const area = status === 'authenticated' ? 'cliente-logado' : 'site';
    crisp('set', 'session:segments', [[PRODUCT.toLowerCase(), area]]);
    crisp('set', 'session:data', [[
      ['produto', PRODUCT],
      ['site', typeof window !== 'undefined' ? window.location.host : 'frotly.com.br'],
      ['pagina', pathname || '/'],
      ['area', area === 'site' ? 'Site / landing page' : 'Sistema (cliente logado)'],
    ]]);
  }, [pathname, status]);

  // Identificação do cliente logado (uma vez por usuário).
  useEffect(() => {
    const user = session?.user as { id?: string; email?: string | null; name?: string | null; role?: string } | undefined;
    if (status !== 'authenticated' || !user?.email || identifiedFor.current === user.email) return;
    identifiedFor.current = user.email;

    crisp('set', 'user:email', [user.email]);
    if (user.name) crisp('set', 'user:nickname', [`${user.name} (${PRODUCT})`]);

    Promise.allSettled([
      api.get<any>('/tenants/me'),
      api.get<any>('/billing/trial/status'),
    ]).then(([tenantRes, billingRes]) => {
      const tenant = tenantRes.status === 'fulfilled' ? (tenantRes.value?.data ?? tenantRes.value) : null;
      const billing = billingRes.status === 'fulfilled' ? (billingRes.value?.data ?? billingRes.value) : null;

      if (tenant?.name) crisp('set', 'user:company', [`${tenant.name} — cliente ${PRODUCT}`]);
      if (tenant?.contactPhone) crisp('set', 'user:phone', [tenant.contactPhone]);
      crisp('set', 'session:data', [[
        ['produto', PRODUCT],
        ['locadora', tenant?.name || '-'],
        ['cnpj', tenant?.cnpj || '-'],
        ['plano', billing?.planName || billing?.plan || '-'],
        ['em_teste', billing?.isTrialActive ? 'sim' : 'nao'],
        ['perfil', user.role || '-'],
      ]]);
    });
  }, [session, status]);

  return null;
}
