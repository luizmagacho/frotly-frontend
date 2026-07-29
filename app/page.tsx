import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#060B18] text-white overflow-x-hidden font-[family-name:var(--font-geist-sans)]">

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/5 backdrop-blur-md bg-[#060B18]/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg shadow-blue-500/30">
            <img src="/logo.jpg?v=2" alt="Frotly Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight">Frotly</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a>
          <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
          <a href="#planos" className="hover:text-white transition-colors">Planos</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">
            Entrar
          </Link>
          <Link href="/registro" className="text-sm bg-blue-600 hover:bg-blue-500 transition-colors px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-600/20">
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Glow background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-cyan-500/8 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-600/8 rounded-full blur-3xl" />
        </div>

        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Novo: Motor de IA integrado para análise preditiva
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
            Gerencie sua locadora
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              como uma grande empresa.
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Contratos, frota, motoristas, multas, manutenção e financeiro em um único lugar. Sem planilhas, sem dor de cabeça.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/registro"
              id="cta-hero-start"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-lg transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              Começar grátis — 14 dias
            </Link>
            <a
              href="#como-funciona"
              id="cta-hero-demo"
              className="px-8 py-4 border border-white/10 hover:border-white/20 rounded-xl font-semibold text-lg transition-all text-slate-300 hover:text-white hover:bg-white/5"
            >
              Ver como funciona →
            </a>
          </div>

          <p className="text-sm text-slate-500 mt-6">Sem cartão de crédito · Cancele quando quiser</p>

          {/* Dashboard preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#060B18] to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-2xl border border-white/10 bg-[#0D1525] overflow-hidden shadow-2xl shadow-black/60 p-6">
              {/* Fake dashboard header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="h-5 w-32 bg-white/10 rounded-md mb-2" />
                  <div className="h-3 w-48 bg-white/5 rounded-md" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-24 bg-blue-600/20 rounded-lg border border-blue-500/20" />
                  <div className="h-8 w-24 bg-white/5 rounded-lg" />
                </div>
              </div>
              {/* Fake stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Veículos ativos', value: '48', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20', accent: 'bg-blue-500' },
                  { label: 'Contratos ativos', value: '31', color: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/20', accent: 'bg-cyan-500' },
                  { label: 'Receita mensal', value: 'R$ 48k', color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20', accent: 'bg-emerald-500' },
                  { label: 'Manutenções', value: '7', color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20', accent: 'bg-amber-500' },
                ].map((card) => (
                  <div key={card.label} className={`p-4 rounded-xl border ${card.border} bg-gradient-to-br ${card.color}`}>
                    <div className="text-xs text-slate-400 mb-2">{card.label}</div>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <div className={`mt-2 h-1 w-16 rounded-full ${card.accent} opacity-60`} />
                  </div>
                ))}
              </div>
              {/* Fake table */}
              <div className="rounded-xl border border-white/5 bg-white/2 overflow-hidden">
                <div className="grid grid-cols-4 text-xs text-slate-500 px-4 py-3 border-b border-white/5 bg-white/3">
                  <span>Veículo</span><span>Motorista</span><span>Status</span><span>Retorno</span>
                </div>
                {[
                  { veiculo: 'Toyota Corolla • ABC-1234', motorista: 'Carlos Mendes', status: 'Alugado', statusColor: 'text-blue-400 bg-blue-500/10', retorno: '15/07' },
                  { veiculo: 'Honda Civic • DEF-5678', motorista: 'Ana Souza', status: 'Disponível', statusColor: 'text-emerald-400 bg-emerald-500/10', retorno: '—' },
                  { veiculo: 'VW Polo • GHI-9012', motorista: 'João Silva', status: 'Manutenção', statusColor: 'text-amber-400 bg-amber-500/10', retorno: '18/07' },
                ].map((row) => (
                  <div key={row.veiculo} className="grid grid-cols-4 text-sm px-4 py-3 border-b border-white/5 last:border-0">
                    <span className="text-white font-medium truncate">{row.veiculo}</span>
                    <span className="text-slate-400">{row.motorista}</span>
                    <span><span className={`text-xs px-2 py-1 rounded-full font-medium ${row.statusColor}`}>{row.status}</span></span>
                    <span className="text-slate-400">{row.retorno}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS / TRUST ── */}
      <section className="py-16 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-sm text-slate-500 mb-8 uppercase tracking-widest">Construído com segurança e confiabilidade</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {[
              { icon: '🔒', label: 'Adequado à LGPD' },
              { icon: '🏢', label: 'Multi-Tenant Isolado' },
              { icon: '🤖', label: 'IA Integrada' },
              { icon: '☁️', label: '99.9% Disponível' },
              { icon: '📱', label: '100% Responsivo' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-slate-400">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ── */}
      <section id="funcionalidades" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-4">
              Funcionalidades
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Tudo que sua locadora precisa</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Do contrato ao financeiro, da vistoria ao Detran. Uma plataforma completa para escalar sem complicação.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '📋',
                title: 'Contratos & Aluguéis',
                desc: 'Emita e gerencie contratos digitais, histórico de locações por cliente e cálculo automático de valores.',
                color: 'blue',
              },
              {
                icon: '🚗',
                title: 'Controle de Frota',
                desc: 'Visão completa de cada veículo: status, quilometragem, documentação, histórico de manutenção e rentabilidade.',
                color: 'cyan',
              },
              {
                icon: '👤',
                title: 'Motoristas & CNH',
                desc: 'Cadastro completo, alerta automático de vencimento de CNH, histórico de locações e pontos de infrações.',
                color: 'indigo',
              },
              {
                icon: '💰',
                title: 'Financeiro Completo',
                desc: 'Fluxo de caixa, contas a pagar e receber, DRE por período, custo total por veículo e rentabilidade da frota.',
                color: 'emerald',
              },
              {
                icon: '🚦',
                title: 'Multas & Detran',
                desc: 'Consulta e gestão de infrações, controle de prazos para recurso, notificações automáticas e relatório de pontos.',
                color: 'amber',
              },
              {
                icon: '🤖',
                title: 'IA para Análise',
                desc: 'Motor de inteligência artificial integrado para análise preditiva de manutenção e insights operacionais em linguagem natural.',
                color: 'violet',
              },
              {
                icon: '🔧',
                title: 'Manutenção Preventiva',
                desc: 'Agendamento por KM ou data, ordens de serviço digitais, histórico completo e alerta de revisões programadas.',
                color: 'rose',
              },
              {
                icon: '⛽',
                title: 'Abastecimento',
                desc: 'Registro de abastecimentos com consumo médio calculado automaticamente por veículo e por motorista.',
                color: 'orange',
              },
              {
                icon: '🔔',
                title: 'Alertas Automáticos',
                desc: 'Notificações via e-mail e WhatsApp para vencimento de documentos, revisões, multas e contratos próximos do fim.',
                color: 'teal',
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="group relative p-6 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-3xl mb-4">{feat.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" className="py-24 px-6 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
              Como funciona
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simples como deve ser</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Em menos de 30 minutos sua locadora estará operando no Frotly.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Cadastre sua frota',
                desc: 'Adicione seus veículos com placa, documentação e fotos. Importe de planilhas ou cadastre manualmente em minutos.',
              },
              {
                step: '02',
                title: 'Gerencie contratos',
                desc: 'Crie contratos para cada locação, controle datas de retorno, calcule valores automaticamente e receba pagamentos.',
              },
              {
                step: '03',
                title: 'Acompanhe resultados',
                desc: 'Dashboard com visão completa da sua operação: ocupação da frota, receita, despesas e indicadores de performance.',
              },
            ].map((step, i) => (
              <div key={step.step} className="relative text-center">
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-blue-400">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENCHMARK / COMPARATIVO ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-sm font-medium mb-4">
            Por que Frotly?
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Feito para locadoras reais</h2>
          <p className="text-slate-400 text-lg mb-16 max-w-2xl mx-auto">
            Sistemas corporativos são caros e complexos demais. Planilhas não escalam. O Frotly foi criado exatamente para o meio: locadoras que querem crescer com tecnologia.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'Veículos gerenciados', value: '+5.000', sub: 'em locadoras parceiras' },
              { label: 'Contratos emitidos', value: '+12.000', sub: 'no último ano' },
              { label: 'Receita gerada', value: 'R$ 8M+', sub: 'em locações controladas' },
            ].map((stat) => (
              <div key={stat.label} className="p-8 rounded-2xl border border-white/8 bg-white/3">
                <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">{stat.value}</div>
                <div className="font-semibold mb-1">{stat.label}</div>
                <div className="text-slate-500 text-sm">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="py-24 px-6 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
              Planos & Preços
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simples e sem surpresas</h2>
            <p className="text-slate-400 text-lg">14 dias grátis em qualquer plano. Sem cartão de crédito.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter',
                price: 'R$ 149',
                period: '/mês',
                desc: 'Para locadoras que estão começando',
                highlight: false,
                features: ['Até 20 veículos', 'Contratos digitais', 'Controle de motoristas', 'Financeiro básico', 'Alertas por e-mail', 'Suporte por chat'],
              },
              {
                name: 'Pro',
                price: 'R$ 349',
                period: '/mês',
                desc: 'Para locadoras em crescimento',
                highlight: true,
                badge: 'Mais popular',
                features: ['Até 100 veículos', 'Tudo do Starter', 'Gestão de multas + Detran', 'Alertas via WhatsApp', 'Relatórios avançados', 'IA para análise preditiva', 'API de integração', 'Suporte prioritário'],
              },
              {
                name: 'Enterprise',
                price: 'Sob consulta',
                period: '',
                desc: 'Para grandes frotas e redes de locadoras',
                highlight: false,
                features: ['Veículos ilimitados', 'Tudo do Pro', 'Multi-unidades / Multi-tenant', 'Customizações', 'SLA garantido', 'Gerente de conta dedicado', 'Integração com ERP'],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border transition-all ${
                  plan.highlight
                    ? 'border-blue-500/60 bg-gradient-to-b from-blue-500/10 to-blue-600/5 shadow-xl shadow-blue-500/10'
                    : 'border-white/8 bg-white/3'
                }`}
              >
                {plan.highlight && plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    {plan.period && <span className="text-slate-400">{plan.period}</span>}
                  </div>
                </div>
                <Link
                  href="/registro"
                  id={`cta-plan-${plan.name.toLowerCase()}`}
                  className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all mb-8 ${
                    plan.highlight
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30'
                      : 'bg-white/8 hover:bg-white/12 border border-white/10'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Falar com vendas' : 'Começar grátis'}
                </Link>
                <ul className="space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Quem já usa o Frotly</h2>
            <p className="text-slate-400 text-lg">Locadoras de todo o Brasil confiam no Frotly para crescer.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: 'Antes eu controlava tudo em planilha Excel. Com o Frotly, tenho visão completa da frota em tempo real. Reduzi inadimplência em 30% no primeiro mês.',
                name: 'Carlos R.',
                role: 'Dono · Locadora Speed',
                city: 'Curitiba, PR',
                avatar: 'CR',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                quote: 'O alerta automático de vencimento de CNH me salvou de várias dores de cabeça. O suporte responde rápido e as atualizações são constantes.',
                name: 'Mariana T.',
                role: 'Gerente · Rent Fast',
                city: 'São Paulo, SP',
                avatar: 'MT',
                color: 'from-violet-500 to-indigo-500',
              },
              {
                quote: 'Finalmente um sistema que não é nem caro demais nem simples demais. Cabe no orçamento da minha locadora pequena e tem tudo que eu preciso.',
                name: 'João P.',
                role: 'Proprietário · JPA Veículos',
                city: 'Fortaleza, CE',
                avatar: 'JP',
                color: 'from-emerald-500 to-teal-500',
              },
            ].map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border border-white/8 bg-white/3 flex flex-col gap-4">
                <div className="flex gap-1 text-amber-400 text-sm">{'★★★★★'}</div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/8">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-slate-500 text-xs">{t.role} · {t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Perguntas frequentes</h2>
            <p className="text-slate-400">Não encontrou o que procurava? Fale com a gente via chat.</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'Preciso instalar algum software?',
                a: 'Não! O Frotly é 100% em nuvem. Funciona diretamente no navegador do computador ou celular, sem instalação.',
              },
              {
                q: 'Posso importar meus dados atuais?',
                a: 'Sim. Oferecemos importação via planilha Excel/CSV para veículos, motoristas e histórico de contratos. Nossa equipe auxilia na migração gratuitamente.',
              },
              {
                q: 'O que acontece após os 14 dias grátis?',
                a: 'Você escolhe um plano e continua usando normalmente. Se não quiser continuar, não cobramos nada. Sem letras miúdas.',
              },
              {
                q: 'É seguro? Meus dados são protegidos?',
                a: 'Totalmente. Utilizamos criptografia de ponta a ponta, backups diários e arquitetura multi-tenant isolada, o que significa que os dados da sua empresa são completamente separados dos demais clientes.',
              },
              {
                q: 'Consigo integrar com outros sistemas?',
                a: 'O plano Pro e Enterprise incluem acesso à nossa API REST. Integramos com meios de pagamento, WhatsApp, e-mail e sistemas de contabilidade.',
              },
              {
                q: 'Tem suporte em português?',
                a: 'Sim! Suporte 100% em português por chat, e-mail e WhatsApp. Equipe brasileira, atendimento de segunda a sexta das 8h às 18h.',
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group p-6 rounded-2xl border border-white/8 bg-white/3 hover:border-white/15 transition-colors cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold text-white list-none">
                  {item.q}
                  <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-slate-400 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[400px] bg-gradient-to-r from-blue-600/10 via-cyan-500/8 to-indigo-600/10 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Pronto para transformar
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              sua locadora?
            </span>
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Junte-se a centenas de locadoras que já saíram das planilhas e crescem com inteligência.
          </p>
          <Link
            href="/registro"
            id="cta-final"
            className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-xl transition-all shadow-2xl shadow-blue-600/40 hover:shadow-blue-500/50 hover:-translate-y-1"
          >
            Criar conta grátis
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <p className="text-slate-500 text-sm mt-5">14 dias grátis · Sem cartão de crédito · Cancele quando quiser</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6 border-t border-white/8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden">
                <img src="/logo.jpg?v=2" alt="Frotly Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-lg">Frotly</span>
              <span className="text-slate-600 text-sm ml-2">© 2026 · Todos os direitos reservados</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Contato</a>
              <a href="https://frotly.com.br" className="hover:text-white transition-colors">frotly.com.br</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
