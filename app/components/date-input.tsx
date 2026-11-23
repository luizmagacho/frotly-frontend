'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Campo de data no formato brasileiro (dd/mm/aaaa) que substitui o <input type="date">.
 * O navegador mostra o input nativo no formato do sistema (às vezes mm/dd/yyyy); este
 * mostra sempre dd/mm/aaaa, mas troca valores com o formulário no mesmo formato do nativo:
 * 'AAAA-MM-DD' (ou 'AAAA-MM-DDTHH:mm' com withTime). Assim os formulários e a API não mudam.
 */
interface DateInputProps {
  id?: string;
  value: string;
  onChange: (iso: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  /** Também pede a hora (HH:mm); o valor vira 'AAAA-MM-DDTHH:mm', como no datetime-local. */
  withTime?: boolean;
  /** 'AAAA-MM-DD': datas antes disso são recusadas. */
  min?: string;
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const pad = (n: number) => String(n).padStart(2, '0');

/** 'AAAA-MM-DD' → 'dd/mm/aaaa' */
function isoToBr(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

/** 'dd/mm/aaaa' → 'AAAA-MM-DD' ('' se incompleta ou inexistente, ex.: 31/02) */
function brToIso(br: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br || '');
  if (!m) return '';
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(y, mo - 1, d);
  if (y < 1900 || dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function maskDate(raw: string): string {
  const v = raw.replace(/\D/g, '').slice(0, 8);
  if (v.length > 4) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
  if (v.length > 2) return `${v.slice(0, 2)}/${v.slice(2)}`;
  return v;
}

function maskTime(raw: string): string {
  const v = raw.replace(/\D/g, '').slice(0, 4);
  return v.length > 2 ? `${v.slice(0, 2)}:${v.slice(2)}` : v;
}

const validTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

export function DateInput({ id, value, onChange, required, disabled, className, withTime, min }: DateInputProps) {
  const [text, setText] = useState(() => isoToBr(value));
  const [time, setTime] = useState(() => (withTime ? (value || '').slice(11, 16) : ''));
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const iso = (value || '').slice(0, 10);
    return iso ? new Date(`${iso}T12:00:00`) : new Date();
  });
  const boxRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);

  const compose = (br: string, t: string) => {
    const iso = brToIso(br);
    if (!iso) return '';
    if (!withTime) return iso;
    return validTime(t) ? `${iso}T${t}` : '';
  };

  // Valor trocado de fora (carregou do servidor, formulário limpo): atualiza o texto.
  // Enquanto a pessoa digita uma data incompleta, o valor fica '' e o texto é mantido.
  useEffect(() => {
    if ((value || '') === compose(text, time)) return;
    setText(isoToBr(value));
    if (withTime) setTime((value || '').slice(11, 16));
    const iso = (value || '').slice(0, 10);
    if (iso) setView(new Date(`${iso}T12:00:00`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Mensagens de validação em português (o "required" do navegador cobre o campo vazio).
  useEffect(() => {
    const iso = brToIso(text);
    let msg = '';
    if (text && !iso) msg = 'Data inválida. Use o formato dd/mm/aaaa.';
    else if (iso && min && iso < min) msg = `A data não pode ser antes de ${isoToBr(min)}.`;
    dateRef.current?.setCustomValidity(msg);
    if (withTime) timeRef.current?.setCustomValidity(time && !validTime(time) ? 'Hora inválida. Use o formato hh:mm.' : '');
  }, [text, time, min, withTime]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const emit = (br: string, t: string) => {
    const next = compose(br, t);
    if (next !== (value || '')) onChange(next);
  };

  const onType = (e: React.ChangeEvent<HTMLInputElement>) => {
    const br = maskDate(e.target.value);
    setText(br);
    emit(br, time);
    const iso = brToIso(br);
    if (iso) setView(new Date(`${iso}T12:00:00`));
  };

  const onTypeTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = maskTime(e.target.value);
    setTime(t);
    emit(text, t);
  };

  const pick = (day: number) => {
    const br = `${pad(day)}/${pad(view.getMonth() + 1)}/${view.getFullYear()}`;
    setText(br);
    // Com hora: se ainda não tem, sugere 09:00 para não deixar o valor incompleto.
    const t = withTime && !validTime(time) ? '09:00' : time;
    if (withTime) setTime(t);
    emit(br, t);
    setOpen(false);
  };

  const year = view.getFullYear();
  const month = view.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = new Date(year, month, 1).getDay();
  const selectedIso = brToIso(text);
  const todayIso = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  })();
  const base = className ?? 'w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white';

  return (
    <div className="relative" ref={boxRef}>
      <div className={withTime ? 'flex gap-2' : undefined}>
        <div className="relative min-w-0 flex-1">
          <input
            ref={dateRef}
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="dd/mm/aaaa"
            value={text}
            onChange={onType}
            onClick={() => !disabled && setOpen(true)}
            required={required}
            disabled={disabled}
            className={`${base} pr-10`}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label="Abrir calendário"
            disabled={disabled}
            onClick={() => setOpen((o) => !o)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </div>
        {withTime && (
          <input
            ref={timeRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="hh:mm"
            aria-label="Hora"
            value={time}
            onChange={onTypeTime}
            required={required}
            disabled={disabled}
            className={`${base.replace(/\bw-full\b/g, '')} w-24 shrink-0 text-center`}
          />
        )}
      </div>

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" aria-label="Mês anterior" onClick={() => setView(new Date(year, month - 1, 1))} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {MONTHS[month]} de {year}
            </span>
            <button type="button" aria-label="Próximo mês" onClick={() => setView(new Date(year, month + 1, 1))} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="py-1 text-xs font-semibold text-slate-400 dark:text-slate-500">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: blanks }, (_, i) => <span key={`b${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const iso = `${year}-${pad(month + 1)}-${pad(day)}`;
              const blocked = !!min && iso < min;
              const selected = iso === selectedIso;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={blocked}
                  onClick={() => pick(day)}
                  className={`rounded-lg py-1.5 text-xs font-medium transition-colors ${
                    selected
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : blocked
                        ? 'cursor-not-allowed text-slate-300 dark:text-slate-600'
                        : `text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 ${iso === todayIso ? 'ring-1 ring-red-400' : ''}`
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
            <button
              type="button"
              className="font-medium text-red-600 hover:underline dark:text-red-400"
              onClick={() => {
                const d = new Date();
                setView(d);
                if (!min || todayIso >= min) {
                  const br = isoToBr(todayIso);
                  const t = withTime && !validTime(time) ? '09:00' : time;
                  setText(br);
                  if (withTime) setTime(t);
                  emit(br, t);
                  setOpen(false);
                }
              }}
            >
              Hoje
            </button>
            {!required && text && (
              <button
                type="button"
                className="text-slate-500 hover:underline dark:text-slate-400"
                onClick={() => {
                  setText('');
                  setTime('');
                  if (value) onChange('');
                  setOpen(false);
                }}
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
