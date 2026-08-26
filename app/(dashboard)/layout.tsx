'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut, getSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { api } from '@/lib/api-client';
import {
  LayoutDashboard, Car, Users, FileText, Wrench, AlertTriangle,
  Receipt, Shield, Fuel, Bell, Settings, Menu, X, Search,
  LogOut, Gauge, FileCheck, DollarSign, Sun, Moon,
  ClipboardCheck, Building2, CalendarCheck, CreditCard,
} from 'lucide-react';

const navGroups = [
  {
    label: 'Geral',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Planos e Pagamento', href: '/planos', icon: CreditCard },
    ],
  },
  {
    label: 'Operação',
    items: [
      { name: 'Veículos', href: '/veiculos', icon: Car },
      { name: 'Motoristas', href: '/motoristas', icon: Users },
      { name: 'Aluguéis', href: '/alugueis', icon: FileText },
      { name: 'Reservas', href: '/reservas', icon: CalendarCheck },
      { name: 'Clientes', href: '/clientes', icon: Building2 },
      { name: 'Vistorias', href: '/vistorias', icon: ClipboardCheck },
      { name: 'Manutenções', href: '/manutencoes', icon: Wrench },
      { name: 'Multas', href: '/multas', icon: AlertTriangle },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { name: 'IPVA', href: '/ipva', icon: Receipt },
      { name: 'Licenciamento', href: '/licenciamento', icon: FileCheck },
      { name: 'Quilometragem', href: '/quilometragem', icon: Gauge },
      { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
      { name: 'Seguros', href: '/seguros', icon: Shield },
      { name: 'Combustível', href: '/abastecimentos', icon: Fuel },
      { name: 'Notificações', href: '/notificacoes', icon: Bell },
      { name: 'Configurações', href: '/configuracoes', icon: Settings },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [planName, setPlanName] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    api
      .get<any>('/billing/trial/status')
      .then((res) => setPlanName(res?.planName || res?.data?.planName || null))
      .catch(() => setPlanName(null));
  }, [session]);

  useEffect(() => {
    const checkAuth = async () => {
      setMounted(true);
      if (typeof window !== 'undefined') {
        let token = localStorage.getItem('accessToken');
        if (!token) {
          try {
            const sessionData = await getSession();
            token = (sessionData?.user as any)?.accessToken || undefined;
            if (token) {
              localStorage.setItem('accessToken', token);
              if ((sessionData?.user as any)?.refreshToken) {
                localStorage.setItem('refreshToken', (sessionData?.user as any).refreshToken);
              }
            }
          } catch (e) {
            console.error('Error fetching session:', e);
          }
        }

        if (!token) {
          router.push('/login');
        } else {
          setLoading(false);
        }
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  if (!mounted || loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-red-600 dark:border-slate-800 dark:border-t-red-500" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Carregando painel seguro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-slate-50 transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-8 w-8 overflow-hidden rounded-lg shadow-md shadow-blue-500/20">
              <img src="/logo.jpg?v=2" alt="Frotly Logo" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">Frotly</span>
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Fleet OS
              </span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3.5">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-1">
              <div className="px-2.5 pb-1 pt-3 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors ${
                          active
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-200 p-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[13px] font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-slate-900 dark:text-white">
                {session?.user?.name || 'Usuário'}
              </p>
              <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">{session?.user?.email}</p>
            </div>
            <button
              onClick={async () => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  try {
                    await signOut({ redirect: false });
                  } catch (e) {}
                  window.location.href = '/login';
                }
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden max-w-[360px] flex-1 items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900 md:flex">
            <Search className="h-[15px] w-[15px] shrink-0 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Pesquisar veículos, motoristas..."
              className="w-full bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 outline-none dark:text-slate-200 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="mr-1 hidden items-center gap-2 sm:flex">
              <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                {session?.user?.name}
              </span>
              {planName && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  {planName}
                </span>
              )}
            </div>

            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Alternar Tema"
            >
              {mounted && resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <Link
              href="/notificacoes"
              className="relative rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="h-5 w-5" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-white p-6 dark:bg-slate-950">{children}</main>
      </div>
    </div>
  );
}
