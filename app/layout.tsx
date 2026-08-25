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
