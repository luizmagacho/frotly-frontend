'use client';

import { useState } from 'react';
import Link from 'next/link';

export function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative border-b border-slate-100">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 overflow-hidden rounded-lg shadow-md shadow-blue-500/20">
            <img src="/logo.jpg?v=2" alt="Frotly" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-tight text-slate-900">Frotly</span>
            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">Fleet OS</span>
          </div>
        </Link>

        <nav className="hidden gap-6 md:flex">
          <a href="#produto" className="text-[13px] font-medium text-slate-600 hover:text-slate-900">Produto</a>
          <a href="#planos" className="text-[13px] font-medium text-slate-600 hover:text-slate-900">Planos</a>
          <a href="#locadoras" className="text-[13px] font-medium text-slate-600 hover:text-slate-900">Para locadoras</a>
        </nav>

        <div className="ml-auto hidden items-center gap-3.5 md:flex">
          <Link href="/login" className="text-[13px] font-medium text-slate-900">Entrar</Link>
          <Link
            href="/registro"
            className="rounded-lg bg-blue-600 px-4.5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700"
          >
            Teste grátis de 7 dias
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-lg text-slate-900 md:hidden"
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4L16 16M16 4L4 16" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 5H17M3 10H17M3 15H17" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-16 z-20 border-b border-slate-200 bg-white px-6 pb-6 pt-2 shadow-lg md:hidden">
          <a onClick={() => setOpen(false)} href="#produto" className="block border-b border-slate-100 py-3.5 text-[15px] font-semibold text-slate-700">Produto</a>
          <a onClick={() => setOpen(false)} href="#planos" className="block border-b border-slate-100 py-3.5 text-[15px] font-semibold text-slate-700">Planos</a>
          <a onClick={() => setOpen(false)} href="#locadoras" className="block py-3.5 text-[15px] font-semibold text-slate-700">Para locadoras</a>
          <div className="mt-4 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex h-12 items-center justify-center rounded-lg border border-slate-200 text-[14.5px] font-semibold text-slate-900"
            >
              Entrar
            </Link>
            <Link
              href="/registro"
              onClick={() => setOpen(false)}
              className="flex h-12 items-center justify-center rounded-lg bg-blue-600 text-[14.5px] font-bold text-white shadow-lg shadow-blue-600/30"
            >
              Teste grátis de 7 dias
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
