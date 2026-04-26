import type { Metadata } from 'next';
import { Syne, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { Header }   from '@/components/layout/Header';
import { Footer }   from '@/components/layout/Footer';
import { Toaster }  from 'react-hot-toast';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500'],
});

export const metadata: Metadata = {
  title: {
    default: 'Tecnoiso — Instrumentação Industrial',
    template: '%s | Tecnoiso',
  },
  description:
    'Equipamentos de medição, calibração e monitoramento para indústrias. Termômetros, manômetros, dataloggers, analisadores e muito mais.',
  keywords: ['instrumentação industrial', 'termômetro', 'manômetro', 'datalogger', 'calibrador', 'medição'],
  authors: [{ name: 'Tecnoiso' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Tecnoiso Shop',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body className="antialiased">
        <Providers>

          {/* Header fixo — flutua sobre a página */}
          <Header />

          {/* Espaçador: main(64) + categories(40) = 104px */}
          <div style={{ height: 104 }} aria-hidden="true" />

          {/* Conteúdo de cada página */}
          <main style={{ minHeight: 'calc(100vh - 104px)' }}>
            {children}
          </main>

          {/* Rodapé */}
          <Footer />

          {/* Toast notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#1c1917',
                border: '1px solid #e2e1dc',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#E63946', secondary: '#fff5f5' },
              },
              error: {
                iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
              },
            }}
          />

        </Providers>
      </body>
    </html>
  );
}