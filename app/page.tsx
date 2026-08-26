import Link from 'next/link';

const shotStats = [
  { label: 'Veículos', value: '50' },
  { label: 'Aluguéis ativos', value: '19' },
  { label: 'Adimplência', value: '70%' },
];

const logos = ['ParanáCar', 'RotaFrota', 'MoveAuto', 'CuritibaVeículos'];

const benefits = [
  {
    title: 'Controle de veículos',
    desc: 'Cadastro completo da frota, documentação e status — alugado, disponível ou em manutenção.',
    icon: (
      <path d="M3 13L4.5 8.2C4.8 7.3 5.6 6.7 6.6 6.7H13.4C14.4 6.7 15.2 7.3 15.5 8.2L17 13M2 13H18V17H2V13ZM6 17V15.4M14 17V15.4" />
    ),
  },
  {
    title: 'Gestão de motoristas',
    desc: 'CPF, CNH e histórico de cada motorista de app vinculado ao veículo que ele dirige.',
    icon: (
      <path d="M7 6.5C8.65685 6.5 10 5.15685 10 3.5C10 1.84315 8.65685 0.5 7 0.5M1.5 17C1.5 13.6863 3.68629 11.5 7 11.5C10.3137 11.5 12.5 13.6863 12.5 17" />
    ),
  },
  {
    title: 'Aluguéis em dia',
    desc: 'Contratos ativos, vencimentos e devoluções acompanhados em tempo real.',
    icon: <path d="M2 8.5H18M6 2V5.5M14 2V5.5M4 4H16C17.1046 4 18 4.89543 18 6V16C18 17.1046 17.1046 18 16 18H4C2.89543 18 2 17.1046 2 16V6C2 4.89543 2.89543 4 4 4Z" />,
  },
  {
    title: 'Financeiro consolidado',
    desc: 'Receita contratada, recebida e inadimplência da frota em um painel só.',
    icon: (
      <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 5.3V14.7M12.7 7.3C12.7 6.3 11.6 5.5 10.2 5.5C8.7 5.5 7.6 6.3 7.6 7.4C7.6 8.4 8.5 8.9 10 9.2C11.7 9.5 12.7 10.1 12.7 11.2C12.7 12.3 11.6 13.1 10.1 13.1C8.7 13.1 7.5 12.4 7.4 11.4" />
    ),
  },
];

const stats = [
  { value: '3.400+', label: 'veículos gerenciados' },
  { value: '180+', label: 'locadoras ativas' },
  { value: 'R$ 12M', label: 'em contratos processados' },
  { value: '99,9%', label: 'uptime do sistema' },
];

const plans = [
  {
    name: 'Starter',
    price: '149',
    desc: 'Locadoras começando',
    highlight: false,
    features: ['Até 20 veículos', 'Contratos digitais', 'Financeiro básico', 'Suporte por chat'],
  },
  {
    name: 'Pro',
    price: '349',
    desc: 'Locadoras em crescimento',
    highlight: true,
    features: ['Até 100 veículos', 'Multas + Detran', 'IA preditiva', 'Suporte prioritário'],
  },
  {
    name: 'Enterprise',
    price: '649',
    desc: 'Grandes frotas e redes',
    highlight: false,
    features: ['Veículos ilimitados', 'Multi-unidades', 'Gerente de conta', 'Integração ERP'],
  },
];

// Barras pareadas (contratado vs. recebido) — mesmo componente visual do gráfico do dashboard.
const chartRaw: [number, number][] = [[62, 48], [70, 55], [58, 50], [80, 60], [74, 68], [86, 63]];
const CHART_MAX = 90, CHART_TOP = 6, CHART_H = 100;
const chartBars = (() => {
  let x = 8;
  return chartRaw.map(([a, b]) => {
    const h1 = (a / CHART_MAX) * CHART_H;
    const h2 = (b / CHART_MAX) * CHART_H;
    const bar = { x, y1: CHART_TOP + CHART_H - h1, h1, x2: x + 15, y2: CHART_TOP + CHART_H - h2, h2 };
    x += 64;
    return bar;
  });
})();

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* NAV */}
      <header className="border-b border-slate-100">
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
          <nav className="flex gap-6">
            <a href="#produto" className="text-[13px] font-medium text-slate-600 hover:text-slate-900">Produto</a>
            <a href="#planos" className="text-[13px] font-medium text-slate-600 hover:text-slate-900">Planos</a>
            <a href="#locadoras" className="text-[13px] font-medium text-slate-600 hover:text-slate-900">Para locadoras</a>
          </nav>
          <div className="ml-auto flex items-center gap-3.5">
            <Link href="/login" className="text-[13px] font-medium text-slate-900">Entrar</Link>
            <Link
              href="/registro"
              className="rounded-lg bg-blue-600 px-4.5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700"
            >
              Teste grátis de 7 dias
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-20 text-center md:pt-24">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-600">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          Feito para locadoras do Paraná
        </div>
        <h1 className="mx-auto mt-5 max-w-3xl text-[52px] font-bold leading-[1.08] tracking-tight text-slate-900">
          Sua frota de aluguel,<br />sob controle total
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-slate-500">
          Contratos, multas, manutenção e financeiro de veículos alugados a motoristas de app — tudo em um sistema só.
          Cadastre sua locadora e comece a usar hoje.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/registro"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-[14.5px] font-semibold text-white shadow-lg shadow-blue-600/40 hover:bg-blue-700"
          >
            Começar teste grátis
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4L14 10L8 16" /></svg>
          </Link>
          <a href="#planos" className="rounded-lg border border-slate-200 px-5 py-3 text-[14.5px] font-medium text-slate-900">Ver planos e preços</a>
        </div>
        <p className="mt-3.5 text-xs text-slate-400">7 dias grátis · sem cartão obrigatório no cadastro · cancele quando quiser</p>

        {/* PRODUCT SHOT */}
        <div className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 text-left shadow-2xl shadow-slate-900/10">
          <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          </div>
          <div className="flex min-h-[400px]">
            <div className="hidden w-[190px] shrink-0 flex-col gap-1 border-r border-slate-100 p-3 sm:flex">
              <div className="flex items-center gap-2.5 rounded-lg bg-blue-50 px-2.5 py-2 text-[12.5px] font-medium text-blue-600">
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="7" height="7" rx="1.5" /><rect x="11" y="2" width="7" height="7" rx="1.5" /><rect x="2" y="11" width="7" height="7" rx="1.5" /><rect x="11" y="11" width="7" height="7" rx="1.5" /></svg>
                Dashboard
              </div>
              <div className="flex items-center gap-2.5 px-2.5 py-2 text-[12.5px] text-slate-500">
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13L4.5 8.2C4.8 7.3 5.6 6.7 6.6 6.7H13.4C14.4 6.7 15.2 7.3 15.5 8.2L17 13" /><rect x="2" y="13" width="16" height="4" rx="1.3" /><circle cx="6" cy="17" r="1.6" /><circle cx="14" cy="17" r="1.6" /></svg>
                Veículos
              </div>
              <div className="flex items-center gap-2.5 px-2.5 py-2 text-[12.5px] text-slate-500">
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="6.5" r="3" /><path d="M1.5 17C1.5 13.7 3.9 11.5 7 11.5C10.1 11.5 12.5 13.7 12.5 17" /></svg>
                Motoristas
              </div>
              <div className="flex items-center gap-2.5 px-2.5 py-2 text-[12.5px] text-slate-500">
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8" /><path d="M10 5.3V14.7M12.7 7.3C12.7 6.3 11.6 5.5 10.2 5.5C8.7 5.5 7.6 6.3 7.6 7.4C7.6 8.4 8.5 8.9 10 9.2C11.7 9.5 12.7 10.1 12.7 11.2C12.7 12.3 11.6 13.1 10.1 13.1C8.7 13.1 7.5 12.4 7.4 11.4" /></svg>
                Financeiro
              </div>
            </div>
            <div className="flex-1 p-5">
              <div className="mb-3 grid grid-cols-3 gap-3">
                {shotStats.map((s) => (
                  <div key={s.label} className="rounded-xl border border-slate-200 p-4">
                    <div className="text-[11.5px] text-slate-400">{s.label}</div>
                    <div className="mt-1.5 text-[22px] font-bold text-slate-900">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-slate-200 p-4.5">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="text-[12.5px] font-semibold text-slate-900">Caixa &amp; Finanças de Aluguel</div>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-600" /><span className="text-[10.5px] text-slate-500">Contratado</span></div>
                    <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /><span className="text-[10.5px] text-slate-500">Recebido</span></div>
                  </div>
                </div>
                <svg width="100%" height="118" viewBox="0 0 400 118" preserveAspectRatio="none">
                  {[0, 1, 2].map((i) => (
                    <line key={i} x1="0" y1={6 + 50 * i} x2="400" y2={6 + 50 * i} stroke="#eceef1" strokeWidth="1" />
                  ))}
                  {chartBars.map((b, i) => (
                    <g key={i}>
                      <rect x={b.x} y={b.y1} width="14" height={b.h1} rx="2.5" fill="#eceef1" />
                      <rect x={b.x2} y={b.y2} width="14" height={b.h2} rx="2.5" fill="#e93338" />
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF STRIP */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-5 px-6 py-7">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Locadoras que já usam o Frotly</span>
          <div className="flex flex-wrap gap-9">
            {logos.map((l) => (
              <span key={l} className="text-[14.5px] font-bold text-slate-300">{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="produto" className="mx-auto max-w-5xl px-6 py-20">
        <div className="mx-auto mb-12 max-w-lg text-center">
          <h2 className="text-[32px] font-bold tracking-tight text-slate-900">Veículos, motoristas, aluguéis e financeiro — sob controle</h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-slate-500">
            Construído para o dia a dia de quem aluga carro pra motorista de aplicativo — não é uma planilha, é operação.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-slate-200 p-5.5">
              <div className="mb-3.5 flex h-9.5 w-9.5 items-center justify-center rounded-[10px] bg-blue-50">
                <svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" className="text-blue-600" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{b.icon}</svg>
              </div>
              <div className="mb-1.5 text-[15px] font-semibold text-slate-900">{b.title}</div>
              <div className="text-[13px] leading-relaxed text-slate-500">{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS BAND */}
      <section className="bg-slate-950">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 py-14 text-center md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-[32px] font-bold tracking-tight text-white tabular-nums">{s.value}</div>
              <div className="mt-1.5 text-[12.5px] text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="planos" className="mx-auto max-w-5xl px-6 py-20">
        <div className="mx-auto mb-11 max-w-md text-center">
          <h2 className="text-[32px] font-bold tracking-tight text-slate-900">Planos para cada tamanho de frota</h2>
          <p className="mt-3 text-[14.5px] text-slate-500">Sem contrato de fidelidade. Comece grátis por 7 dias em qualquer plano.</p>
        </div>
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl p-7 ${
                p.highlight ? 'border-2 border-blue-600 bg-slate-950' : 'border border-slate-200 bg-white'
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-2.5 left-6 rounded-full bg-blue-600 px-3 py-1 text-[10.5px] font-bold text-white">
                  Mais popular
                </span>
              )}
              <div className={`text-[13.5px] font-semibold ${p.highlight ? 'text-slate-300' : 'text-slate-400'}`}>{p.name}</div>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className={`text-sm font-semibold ${p.highlight ? 'text-slate-400' : 'text-slate-400'}`}>R$</span>
                <span className={`text-[38px] font-bold tracking-tight tabular-nums ${p.highlight ? 'text-white' : 'text-slate-900'}`}>{p.price}</span>
                <span className={`text-[13px] ${p.highlight ? 'text-slate-400' : 'text-slate-400'}`}>/mês</span>
              </div>
              <div className={`mt-1.5 text-xs ${p.highlight ? 'text-slate-400' : 'text-slate-400'}`}>{p.desc}</div>
              <div className={`mt-5 flex flex-col gap-2.5 border-t pt-5 ${p.highlight ? 'border-slate-800' : 'border-slate-100'}`}>
                {p.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#e93338" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10.5L8 14.5L16 5.5" /></svg>
                    <span className={`text-[12.5px] ${p.highlight ? 'text-slate-200' : 'text-slate-700'}`}>{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/registro"
                className={`mt-6 block rounded-lg py-2.5 text-center text-[13px] font-semibold ${
                  p.highlight ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'
                }`}
              >
                Assinar {p.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="locadoras" className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-[20px] bg-gradient-to-br from-blue-600 to-blue-800 px-14 py-14 text-center">
          <h2 className="text-[28px] font-bold tracking-tight text-white">Pronto pra organizar sua locadora?</h2>
          <p className="mt-2.5 text-sm text-white/85">Cadastre-se em 2 minutos. Seu primeiro usuário admin é criado na hora.</p>
          <Link
            href="/registro"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-semibold text-blue-600"
          >
            Começar teste grátis de 7 dias
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#e93338" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4L14 10L8 16" /></svg>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-7">
          <div className="flex items-center gap-2.5">
            <div className="h-5.5 w-5.5 rounded-md bg-gradient-to-br from-blue-600 to-blue-700" />
            <span className="text-[12.5px] font-bold text-slate-900">Frotly</span>
            <span className="text-[11.5px] text-slate-400">© 2026</span>
          </div>
          <div className="flex gap-5">
            <a href="#" className="text-xs font-medium text-slate-500">Termos</a>
            <a href="#" className="text-xs font-medium text-slate-500">Privacidade</a>
            <a href="#" className="text-xs font-medium text-slate-500">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
