'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function SignInPage() {
  const params  = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/';

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-800/10 rounded-full blur-3xl" />
      </div>

      <div className="relative card w-full max-w-sm p-8 text-center animate-scale-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-800 text-white text-xl">
            TECNO<span className="text-brand-500">ISO</span>
          </span>
        </div>

        <h1 className="font-display font-800 text-2xl text-white mb-2">Entrar na sua conta</h1>
        <p className="text-dark-400 text-sm mb-8">
          Acesse para visualizar pedidos e realizar compras com mais facilidade.
        </p>

        <button
          onClick={() => signIn('google', { callbackUrl })}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-display font-600 rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar com Google
        </button>

        <p className="text-xs text-dark-600 mt-6">
          Ao entrar, você concorda com nossos{' '}
          <a href="#" className="text-brand-500 hover:underline">Termos de Uso</a>
          {' '}e{' '}
          <a href="#" className="text-brand-500 hover:underline">Política de Privacidade</a>.
        </p>
      </div>
    </div>
  );
}
