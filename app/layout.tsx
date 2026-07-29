import type { Metadata } from 'next';
import { Providers } from '@/lib/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Frotly — Gerencie sua locadora como uma grande empresa',
  description: 'Contratos, frota, motoristas, multas, manutenção e financeiro em um único lugar. O sistema de gestão de frotas para locadoras modernas.',
  keywords: ['gestão de frotas', 'locadora de veículos', 'sistema de locação', 'software frota', 'controle de veículos'],
  authors: [{ name: 'Frotly' }],
  openGraph: {
    title: 'Frotly — Gestão de Frotas para Locadoras',
    description: 'Contratos, frota, multas e financeiro em um só lugar. Comece grátis hoje.',
    url: 'https://frotly.com.br',
    siteName: 'Frotly',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
