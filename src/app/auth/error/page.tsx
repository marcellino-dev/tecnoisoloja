'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorContent() {
  const params = useSearchParams();
  const error  = params.get('error');

  const messages: Record<string, string> = {
    OAuthSignin:        'Erro ao iniciar login com Google.',
    OAuthCallback:      'Erro no callback do Google.',
    OAuthCreateAccount: 'Não foi possível criar conta.',
    default:            'Ocorreu um erro ao fazer login. Tente novamente.',
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="card w-full max-w-sm p-8 text-center">
        <div className="w-14 h-14 bg-red-900/20 border border-red-800/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="font-display font-800 text-xl text-white mb-2">Erro de autenticação</h1>
        <p className="text-dark-400 text-sm mb-6">
          {messages[error || ''] || messages.default}
        </p>
        <Link href="/auth/signin" className="btn-primary w-full justify-center">
          Tentar novamente
        </Link>
        <Link href="/" className="btn-ghost w-full justify-center mt-2">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return <Suspense><AuthErrorContent /></Suspense>;
}