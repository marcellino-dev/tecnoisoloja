import type { Metadata } from 'next';
import { Syne, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css'
import { Providers } from '@/components/layout/Providers';
import { Toaster } from 'react-hot-toast';

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
      {/*
        Sem bg-* aqui — o body já recebe background via globals.css (:root + body).
        Isso evita conflito de especificidade entre Tailwind e CSS custom properties.
      */}
      <body className="antialiased">
        <Providers>
          {children}
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
                iconTheme: { primary: '#ea580c', secondary: '#fff7ed' },
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