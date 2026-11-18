'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, X, Loader2 } from 'lucide-react';

/**
 * Formulário curto antes do chat para visitantes do site (não logados).
 *
 * Por quê: no chat padrão da Crisp o visitante pode escrever sem se identificar,
 * e o contato chegava por e-mail sem nome, telefone nem produto. Aqui o botão do
 * chat é nosso: pede nome e telefone, grava na ficha do contato na Crisp e abre a
 * conversa já com a primeira mensagem assinada — então o e-mail de notificação
 * traz quem é, como falar com a pessoa e que veio do site do Frotly.
 *
 * Depois de preenchido uma vez (guardado no navegador), o botão da Crisp volta a
 * aparecer normalmente.
 */

type CrispQueue = unknown[][];
export const LEAD_STORAGE_KEY = 'frotly_chat_lead';
const PRODUCT = 'Frotly';

export type ChatLead = { name: string; phone: string; email?: string };

function crisp(...cmd: unknown[]) {
  const w = window as unknown as { $crisp?: CrispQueue };
  w.$crisp = w.$crisp || [];
  w.$crisp.push(cmd);
}

export function readLead(): ChatLead | null {
  try {
    const raw = window.localStorage.getItem(LEAD_STORAGE_KEY);
    const lead = raw ? JSON.parse(raw) : null;
    return lead?.name && lead?.phone ? lead : null;
  } catch {
    return null;
  }
}

/** Grava nome/telefone/e-mail na ficha do contato da Crisp. */
export function identifyLead(lead: ChatLead) {
  crisp('set', 'user:nickname', [`${lead.name} (${PRODUCT})`]);
  crisp('set', 'user:phone', [lead.phone]);
  if (lead.email) crisp('set', 'user:email', [lead.email]);
  crisp('set', 'session:data', [[
    ['nome', lead.name],
    ['telefone', lead.phone],
    ['email', lead.email || '-'],
  ]]);
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CrispLeadForm({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const clear = (k: string) => errors[k] && setErrors((prev) => { const next = { ...prev }; delete next[k]; return next; });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'Informe seu nome.';
    if (phone.replace(/\D/g, '').length < 10) next.phone = 'Informe um telefone com DDD.';
    if (email.trim() && !EMAIL_RE.test(email.trim())) next.email = 'E-mail inválido.';
    if (!message.trim()) next.message = 'Escreva sua mensagem.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    const lead: ChatLead = { name: name.trim(), phone, email: email.trim() || undefined };
    try {
      window.localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(lead));
    } catch {
      /* navegador sem storage: segue só com a Crisp */
    }

    identifyLead(lead);
    crisp('set', 'session:event', [[['lead_site', { nome: lead.name, telefone: lead.phone, produto: PRODUCT }, 'red']]]);

    // A assinatura no fim garante que o e-mail de notificação da Crisp mostre
    // quem é e de onde veio, mesmo que o e-mail não exiba a ficha do contato.
    const contact = [lead.name, lead.phone, lead.email].filter(Boolean).join(' · ');
    crisp('do', 'chat:show');
    crisp('do', 'message:send', ['text', `${message.trim()}\n\n— ${contact} · via site ${PRODUCT}`]);
    crisp('do', 'chat:open');

    setOpen(false);
    setSending(false);
    onDone();
  }

  const field =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';
  const err = (k: string) =>
    errors[k] ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[k]}</p> : null;

  return (
    <div className="fixed bottom-5 right-5 z-[1000] flex flex-col items-end gap-3">
      {open && (
        <form
          onSubmit={submit}
          noValidate
          aria-label="Fale com o Frotly"
          className="w-[calc(100vw-2.5rem)] max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-950"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Fale com o Frotly</h2>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Respondemos por aqui ou pelo seu telefone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="lead-name" className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Nome *</label>
              <input id="lead-name" autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); clear('name'); }} className={field} autoFocus />
              {err('name')}
            </div>
            <div>
              <label htmlFor="lead-phone" className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Telefone / WhatsApp *</label>
              <input
                id="lead-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(41) 99999-9999"
                value={phone}
                onChange={(e) => { setPhone(maskPhone(e.target.value)); clear('phone'); }}
                className={field}
              />
              {err('phone')}
            </div>
            <div>
              <label htmlFor="lead-email" className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">E-mail (opcional)</label>
              <input id="lead-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); clear('email'); }} className={field} />
              {err('email')}
            </div>
            <div>
              <label htmlFor="lead-message" className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Mensagem *</label>
              <textarea
                id="lead-message"
                rows={3}
                placeholder="Ex.: Tenho 15 carros de aplicativo e quero conhecer o sistema."
                value={message}
                onChange={(e) => { setMessage(e.target.value); clear('message'); }}
                className={`${field} resize-none`}
              />
              {err('message')}
            </div>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {sending && <Loader2 className="h-4 w-4 animate-spin" />}
            Iniciar conversa
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Fechar chat' : 'Abrir chat'}
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:scale-105 hover:bg-red-700"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
