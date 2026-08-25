import type { Metadata } from 'next';
import { Providers } from '@/lib/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Frotly | Sistema para Locadora de Veículos e Gestão de Frotas',
  description: 'O sistema mais simples e completo para locadoras de veículos. Tenha o controle de aluguel de carros, contratos, multas, CNHs e manutenção em um só lugar.',
  keywords: ['sistema para locadora de veículos', 'controle de aluguel de carros', 'software para locadora de carros', 'gestão de frotas', 'sistema de locação de veículos', 'Frotly'],
  authors: [{ name: 'Frotly' }],
  openGraph: {
    title: 'Frotly | Sistema para Locadoras e Gestão de Frotas',
    description: 'O sistema mais simples e completo para controle de aluguel de carros, frotas, multas e financeiro em um só lugar.',
    url: 'https://frotly.com.br',
    siteName: 'Frotly',
    locale: 'pt_BR',
    type: 'website',
  },
};

import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <Script
          id="crisp-chat"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.$crisp=[];window.CRISP_WEBSITE_ID="43cffa01-a84d-4fa8-a3ea-c06380b621a0";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();`
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
