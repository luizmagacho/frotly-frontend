'use client';

import { Fragment, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight, Download, History, Search } from 'lucide-react';
import { api } from '@/lib/api-client';
import { ROLE_LABELS, useMe } from '@/lib/use-me';
import { DatePicker } from '@/app/components/date-picker';

type Change = { field: string; from: unknown; to: unknown; sub?: string; index?: number; hint?: string; op?: 'added' | 'removed' };
type Log = {
  _id: string;
  createdAt: string;
  actorId: string;
  actorName: string | null;
  actorEmail: string | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId: string | null;
  label: string | null;
  changes: Change[];
  snapshot?: Record<string, unknown> | null;
  count?: number | null;
};
type LogsResponse = { data: Log[]; total: number; page: number; limit: number; entities: Record<string, string> };

const ACTIONS: Record<Log['action'], { label: string; cls: string }> = {
  CREATE: { label: 'Criou', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  UPDATE: { label: 'Editou', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  DELETE: { label: 'Excluiu', cls: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
};

/** Nomes dos campos em português (todos os módulos). */
const FIELD_LABELS: Record<string, string> = {
  // Geral
  name: 'Nome', email: 'E-mail', phone: 'Telefone', status: 'Status', type: 'Tipo', category: 'Categoria',
  description: 'Descrição', notes: 'Observações', observations: 'Observações', title: 'Título', date: 'Data',
  startDate: 'Início', endDate: 'Fim', dueDate: 'Vencimento', paidAt: 'Pago em', amount: 'Valor', value: 'Valor',
  cost: 'Custo', year: 'Ano', document: 'Documento', number: 'Número', street: 'Rua', address: 'Endereço',
  city: 'Cidade', zipCode: 'CEP', isActive: 'Ativo', location: 'Local', source: 'Origem', metadata: 'Detalhes',
  // Usuários
  role: 'Cargo', pendingInvite: 'Convite pendente', invitedAt: 'Convidado em', invitedBy: 'Convidado por',
  deactivatedAt: 'Desativado em',
  // Veículos
  licensePlate: 'Placa', brand: 'Marca', model: 'Modelo', modelYear: 'Ano do modelo', color: 'Cor', renavam: 'Renavam',
  chassis: 'Chassi', mileage: 'Quilometragem', currentMileage: 'Km atual', fuelType: 'Combustível', transmission: 'Câmbio',
  seats: 'Lugares', photos: 'Fotos', currentDriverId: 'Motorista atual', purchaseValue: 'Valor de compra',
  currentValue: 'Valor atual', fipeCode: 'Código FIPE', fipeModelName: 'Versão FIPE', fipeYearCode: 'Ano FIPE',
  crlvDocument: 'CRLV', insuranceDocument: 'Apólice (arquivo)', insuranceExpiration: 'Vencimento do seguro',
  ipvaDueDate: 'Vencimento do IPVA', licensingDueDate: 'Vencimento do licenciamento',
  nextMaintenanceDate: 'Próxima manutenção', nextMaintenanceMileage: 'Km da próxima manutenção',
  // Motoristas
  cpf: 'CPF', cnh: 'CNH', licenseNumber: 'Nº da CNH', licenseCategory: 'Categoria da CNH',
  licenseExpiration: 'Validade da CNH', licenseDocument: 'CNH (arquivo)', profilePhoto: 'Foto', rating: 'Avaliação',
  platforms: 'Plataformas',
  // Clientes e reservas
  customerId: 'Cliente', estimatedAmount: 'Valor estimado',
  // Aluguéis
  vehicleId: 'Veículo', driverId: 'Motorista', rentalId: 'Aluguel', rentalAmount: 'Valor do aluguel',
  weeklyAmount: 'Valor semanal', paymentFrequency: 'Frequência de pagamento', paymentMethod: 'Forma de pagamento',
  securityDeposit: 'Caução', expectedEndDate: 'Término previsto', payments: 'Pagamentos', fine: 'Multa por atraso',
  contractPath: 'Contrato', receiptPath: 'Comprovante', mileageLogs: 'Registros de km', previousMileage: 'Km anterior',
  newMileage: 'Km novo', kmDriven: 'Km rodados', weeklyKmLimit: 'Limite de km/semana', excessKmFee: 'Valor do km excedente',
  // Manutenções
  scheduledDate: 'Data agendada', completedDate: 'Concluída em', workshopName: 'Oficina', workshopPhone: 'Telefone da oficina',
  services: 'Serviços', parts: 'Peças', mileageAtService: 'Km no serviço', nextServiceDate: 'Próxima revisão',
  nextServiceMileage: 'Km da próxima revisão',
  // Abastecimentos
  volume: 'Litros', pricePerUnit: 'Preço por litro', totalCost: 'Valor total', stationName: 'Posto', isFullTank: 'Tanque cheio',
  // Financeiro, IPVA, licenciamento, seguro
  sourceId: 'Origem', installments: 'Parcelas', installmentNumber: 'Parcela', totalAmount: 'Valor total', discount: 'Desconto',
  financialEntryId: 'Lançamento', provider: 'Seguradora', insurer: 'Seguradora', policyNumber: 'Nº da apólice',
  coverageType: 'Cobertura', franchiseAmount: 'Franquia', brokerName: 'Corretor', brokerPhone: 'Telefone do corretor',
  // Multas
  noticeNumber: 'Auto de infração', infractionCode: 'Código da infração', infractionDate: 'Data da infração',
  issuingAgency: 'Órgão autuador', points: 'Pontos', driverIndicated: 'Condutor indicado', chargeToDriver: 'Cobrar do motorista',
  driverChargeStatus: 'Cobrança do motorista', driverChargeRef: 'Referência da cobrança',
  // Vistorias
  inspectorName: 'Vistoriador', fuelLevel: 'Combustível', signature: 'Assinatura', photoUrl: 'Foto',
  // Locadora
  cnpj: 'CNPJ', contactEmail: 'E-mail de contato', contactPhone: 'Telefone de contato', plan: 'Plano',
  legalRepresentativeName: 'Representante legal', subdomain: 'Subdomínio', logoUrl: 'Logo', primaryColor: 'Cor principal',
};

/** Como chamar um item de cada lista ("Pagamento 3"). */
const ITEM_LABELS: Record<string, string> = {
  payments: 'Pagamento', mileageLogs: 'Registro de km', services: 'Serviço', parts: 'Peça', photos: 'Foto',
  installments: 'Parcela', platforms: 'Plataforma',
};

/** Valores fixos (status, tipos) em português. */
const VALUE_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo', INACTIVE: 'Inativo', SUSPENDED: 'Suspenso', PENDING: 'Pendente', PAID: 'Pago', OVERDUE: 'Atrasado',
  CANCELLED: 'Cancelado', COMPLETED: 'Concluído', CONFIRMED: 'Confirmada', SCHEDULED: 'Agendada', IN_PROGRESS: 'Em andamento',
  APPEALED: 'Recorrida', EXPIRED: 'Vencido', AVAILABLE: 'Disponível', RENTED: 'Alugado', MAINTENANCE: 'Em manutenção',
  INCOME: 'Receita', EXPENSE: 'Despesa', PREVENTIVE: 'Preventiva', CORRECTIVE: 'Corretiva', INSPECTION: 'Vistoria',
  WEEKLY: 'Semanal', BIWEEKLY: 'Quinzenal', MONTHLY: 'Mensal', PIX: 'Pix', CASH: 'Dinheiro', BOLETO: 'Boleto',
  CREDIT_CARD: 'Cartão de crédito', DEBIT_CARD: 'Cartão de débito', TRANSFER: 'Transferência',
  GASOLINE: 'Gasolina', ETHANOL: 'Etanol', DIESEL: 'Diesel', FLEX: 'Flex', ELECTRIC: 'Elétrico', HYBRID: 'Híbrido', CNG: 'GNV',
  MANUAL: 'Manual', AUTOMATIC: 'Automático', CVT: 'CVT', PF: 'Pessoa física', PJ: 'Pessoa jurídica',
  BASIC: 'Básico', PRO: 'Pro', ENTERPRISE: 'Enterprise', SYSTEM: 'Sistema', USER: 'Usuário',
  monthly: 'Mensal', annual: 'Anual', annual_installments: 'Anual parcelado',
};

const MONEY_FIELDS = new Set([
  'amount', 'value', 'cost', 'rentalAmount', 'weeklyAmount', 'securityDeposit', 'fine', 'totalCost', 'pricePerUnit',
  'estimatedAmount', 'franchiseAmount', 'purchaseValue', 'currentValue', 'excessKmFee', 'discount', 'totalAmount',
]);
const KM_FIELDS = new Set(['mileage', 'currentMileage', 'previousMileage', 'newMileage', 'kmDriven', 'weeklyKmLimit', 'mileageAtService', 'nextServiceMileage', 'nextMaintenanceMileage']);
const REF_FIELDS = new Set(['vehicleId', 'driverId', 'customerId', 'rentalId', 'currentDriverId', 'invitedBy', 'sourceId', 'financialEntryId', '_id']);

const fieldLabel = (f: string) => {
  const parts = f.split('.');
  return parts.map((p) => FIELD_LABELS[p] ?? p).join(' › ');
};
const lastKey = (f: string) => f.split('.').pop() ?? f;

const isoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
function fmtDate(v: string, field: string): string {
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  // Datas "puras" (vencimento, validade) são gravadas à meia-noite UTC: mostra o dia sem fuso.
  if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0) return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  // Campos "...At" são momentos (pago em, convidado em): data e hora. Os demais, só o dia.
  if (/At$/.test(field)) return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
  return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

function fmtValue(fieldPath: string, v: unknown): string {
  const field = lastKey(fieldPath);
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
  if (Array.isArray(v)) return v.length ? v.map((x) => fmtValue(field, x)).join(', ') : '—';
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if (typeof o.count === 'number' && Object.keys(o).length === 1) return `${o.count} ${o.count === 1 ? 'item' : 'itens'}`;
    return Object.entries(o).map(([k, x]) => `${fieldLabel(k)}: ${fmtValue(k, x)}`).join(' · ');
  }
  if (field === 'role' && typeof v === 'string') return ROLE_LABELS[v] ?? v;
  if (typeof v === 'number') {
    if (MONEY_FIELDS.has(field)) return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if (KM_FIELDS.has(field)) return `${v.toLocaleString('pt-BR')} km`;
    return v.toLocaleString('pt-BR');
  }
  const s = String(v);
  if (isoDate.test(s)) return fmtDate(s, field);
  if (REF_FIELDS.has(field) && /^[a-f0-9]{24}$/.test(s)) return `#${s.slice(-6)}`;
  if (VALUE_LABELS[s]) return VALUE_LABELS[s];
  // Registros antigos guardavam listas inteiras como texto cortado: não dá para detalhar.
  if (/^[[{]/.test(s) && s.endsWith('…')) return '(lista alterada; detalhes não disponíveis neste registro antigo)';
  if (/^\[/.test(s)) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return `${arr.length} ${arr.length === 1 ? 'item' : 'itens'}`;
    } catch { /* texto comum */ }
  }
  return s;
}

/** "Pagamento 3 (venc. 21/05/2026)" */
function itemTitle(c: Change): string {
  const base = `${ITEM_LABELS[c.field] ?? fieldLabel(c.field)} ${c.index}`;
  if (!c.hint) return base;
  const hint = isoDate.test(c.hint) ? `${c.field === 'payments' ? 'venc. ' : ''}${fmtDate(c.hint, 'dueDate')}` : c.hint;
  return `${base} (${hint})`;
}

const toApiDate = (br: string) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined;
};

const selectCls =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white';

function ChangeList({ log }: { log: Log }) {
  if (log.action === 'DELETE' && log.snapshot) {
    const rows = Object.entries(log.snapshot).filter(([k, v]) => k !== '_id' && v !== null && v !== '' && !(Array.isArray(v) && !v.length));
    return (
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Cópia do registro excluído</p>
        <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-2 text-xs">
              <dt className="shrink-0 text-slate-500 dark:text-slate-400">{fieldLabel(k)}:</dt>
              <dd className="break-words text-slate-800 dark:text-slate-200">{fmtValue(k, v)}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }
  if (!log.changes.length) return <p className="text-xs text-slate-500 dark:text-slate-400">Registro criado.</p>;
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-left text-slate-500 dark:text-slate-400">
          <th className="py-1 pr-4 font-medium">Campo</th>
          <th className="py-1 pr-4 font-medium">Antes</th>
          <th className="py-1 font-medium">Depois</th>
        </tr>
      </thead>
      <tbody>
        {log.changes.map((c, i) => {
          const key = `${c.field}.${c.index ?? ''}.${c.sub ?? ''}.${c.op ?? ''}.${i}`;
          const valueField = c.sub ?? c.field;
          let title: React.ReactNode = fieldLabel(c.field);
          if (c.index) {
            title = (
              <>
                {itemTitle(c)}
                <span className="block font-normal text-slate-500 dark:text-slate-400">
                  {c.op === 'added' ? 'Adicionado' : c.op === 'removed' ? 'Removido' : fieldLabel(c.sub ?? '')}
                </span>
              </>
            );
          } else if (c.sub) {
            title = `${fieldLabel(c.field)} › ${fieldLabel(c.sub)}`;
          }
          return (
            <tr key={key} className="align-top">
              <td className="py-1 pr-4 font-medium text-slate-700 dark:text-slate-300">{title}</td>
              <td className="break-words py-1 pr-4 text-slate-500 line-through decoration-slate-300 dark:text-slate-400 dark:decoration-slate-600">{fmtValue(valueField, c.from)}</td>
              <td className="break-words py-1 text-slate-900 dark:text-white">{fmtValue(valueField, c.to)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function AuditoriaPage() {
  const me = useMe();
  const [filters, setFilters] = useState({ entity: '', action: '', actorId: '', from: '', to: '', q: '' });
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const params = {
    entity: filters.entity || undefined,
    action: filters.action || undefined,
    actorId: filters.actorId || undefined,
    from: toApiDate(filters.from),
    to: toApiDate(filters.to),
    q: filters.q.trim() || undefined,
  };

  const { data, isLoading, isFetching, error } = useQuery<LogsResponse>({
    queryKey: ['audit-logs', params, page],
    queryFn: () => api.get('/audit-logs', { ...params, page, limit: 25 }),
    enabled: me.isAdmin,
    placeholderData: keepPreviousData,
    retry: false,
  });
  const { data: users } = useQuery<{ users: { id: string; name: string; email: string }[] }>({
    queryKey: ['users'],
    queryFn: () => api.get('/users'),
    enabled: me.isAdmin,
  });

  const set = (k: keyof typeof filters, v: string) => {
    setFilters((f) => ({ ...f, [k]: v }));
    setPage(1);
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      await api.download('/audit-logs/export', params, `auditoria-frotly-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (e: any) {
      toast.error(e?.message || 'Não foi possível exportar.');
    } finally {
      setExporting(false);
    }
  };

  if (!me.loaded) return null;
  if (!me.isAdmin) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Apenas administradores podem ver a auditoria.</p>;
  }

  const entities = data?.entities ?? {};
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Auditoria</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quem criou, editou ou excluiu cada registro, e quando. Os registros não podem ser alterados.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Download className="h-4 w-4" /> {exporting ? 'Exportando…' : 'Exportar CSV'}
        </button>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 xl:grid-cols-6">
        <label className="relative sm:col-span-2">
          <span className="sr-only">Buscar</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={filters.q} onChange={(e) => set('q', e.target.value)} placeholder="Placa, nome ou usuário" className={`${selectCls} w-full pl-9`} />
        </label>
        <select aria-label="Módulo" value={filters.entity} onChange={(e) => set('entity', e.target.value)} className={selectCls}>
          <option value="">Todos os módulos</option>
          {Object.entries(entities)
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
        </select>
        <select aria-label="Ação" value={filters.action} onChange={(e) => set('action', e.target.value)} className={selectCls}>
          <option value="">Todas as ações</option>
          {Object.entries(ACTIONS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <select aria-label="Usuário" value={filters.actorId} onChange={(e) => set('actorId', e.target.value)} className={`${selectCls} sm:col-span-2`}>
          <option value="">Todos os usuários</option>
          {users?.users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
        <div className="xl:col-span-3">
          <DatePicker label="De" value={filters.from} onChange={(v) => set('from', v)} />
        </div>
        <div className="xl:col-span-3">
          <DatePicker label="Até" value={filters.to} onChange={(v) => set('to', v)} />
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      ) : error ? (
        <p className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800">Não foi possível carregar a auditoria.</p>
      ) : !data?.data.length ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <History className="h-6 w-6" />
          Nenhuma ação encontrada{Object.values(params).some(Boolean) ? ' com esses filtros' : ' ainda'}.
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${isFetching ? 'opacity-70' : ''}`}>
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                <th className="w-8 px-3 py-3" />
                <th className="px-3 py-3">Data</th>
                <th className="px-3 py-3">Usuário</th>
                <th className="px-3 py-3">Ação</th>
                <th className="px-3 py-3">Módulo</th>
                <th className="px-3 py-3">Registro</th>
                <th className="px-3 py-3">O que mudou</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {data.data.map((log) => {
                const expanded = open === log._id;
                const summary =
                  log.action === 'UPDATE'
                    ? [...new Set(log.changes.map((c) => (c.index ? `${ITEM_LABELS[c.field] ?? fieldLabel(c.field)} ${c.index}` : fieldLabel(c.sub ? `${c.field}.${c.sub}` : c.field))))].join(', ')
                    : log.action === 'DELETE'
                      ? 'Ver cópia do registro'
                      : '—';
                return (
                  <Fragment key={log._id}>
                    <tr className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={() => setOpen(expanded ? null : log._id)}>
                      <td className="px-3 py-3 text-slate-400">{expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-600 dark:text-slate-300">
                        {new Date(log.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-900 dark:text-white">{log.actorName ?? '—'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{log.actorEmail}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ACTIONS[log.action]?.cls}`}>{ACTIONS[log.action]?.label ?? log.action}</span>
                      </td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-300">{entities[log.entity] ?? log.entity}</td>
                      <td className="max-w-[200px] truncate px-3 py-3 font-medium text-slate-900 dark:text-white" title={log.label ?? undefined}>
                        {log.label ?? log.entityId?.slice(-6) ?? '—'}
                      </td>
                      <td className="max-w-[260px] truncate px-3 py-3 text-slate-500 dark:text-slate-400" title={summary}>
                        {summary}
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="bg-slate-50/60 dark:bg-slate-800/30">
                        <td />
                        <td colSpan={6} className="px-3 py-4">
                          <ChangeList log={log} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span>
              {data.total.toLocaleString('pt-BR')} ação(ões) · página {page} de {pages}
            </span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium disabled:opacity-40 dark:border-slate-700">
                Anterior
              </button>
              <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium disabled:opacity-40 dark:border-slate-700">
                Próxima
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
