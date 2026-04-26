'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function SignInContent() {
  const params      = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/';

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .signin-card { animation: fadeInUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }

        .btn-google {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 20px;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          color: #1c1917;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-body), sans-serif;
        }
        .btn-google:hover {
          background: #f9fafb;
          border-color: #d1d5db;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }
        .btn-google:active { transform: scale(0.98); }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#f8f7f6',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Header */}
        <header style={{
          height: 64,
          background: '#0a0a0a',
          borderBottom: '2px solid #E63946',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image
              src="/logotecnoiso.png"
              alt="Tecnoiso"
              width={130}
              height={36}
              style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
            />
          </Link>
        </header>

        {/* Body */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px',
        }}>
          <div
            className="signin-card"
            style={{
              width: '100%',
              maxWidth: 420,
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            {/* Faixa vermelha */}
            <div style={{ height: 4, background: '#E63946' }} />

            <div style={{ padding: '36px 40px 40px' }}>

              {/* Título */}
              <div style={{ marginBottom: 28 }}>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 26,
                  color: '#0a0a0a',
                  lineHeight: 1.2,
                  margin: '0 0 8px',
                }}>
                  Olá! Entre na sua conta<br />
                  <span style={{ color: '#E63946' }}>para continuar</span>
                </h1>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                  Acesse para visualizar pedidos e realizar compras com facilidade.
                </p>
              </div>

              {/* Botão Google */}
              <button
                className="btn-google"
                onClick={() => signIn('google', { callbackUrl })}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </button>

              {/* Termos */}
              <p style={{
                fontSize: 12,
                color: '#9ca3af',
                textAlign: 'center',
                marginTop: 20,
                lineHeight: 1.6,
              }}>
                Ao entrar, você concorda com nossos{' '}
                <Link href="/termos" style={{ color: '#E63946', textDecoration: 'none', fontWeight: 500 }}>
                  Termos de Uso
                </Link>
                {' '}e{' '}
                <Link href="/privacidade" style={{ color: '#E63946', textDecoration: 'none', fontWeight: 500 }}>
                  Política de Privacidade
                </Link>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          padding: '18px 24px',
          textAlign: 'center',
          borderTop: '1px solid #e5e7eb',
          background: '#fff',
        }}>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
            © {new Date().getFullYear()} Tecnoiso Instrumentação Industrial
          </p>
        </footer>
      </div>
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}