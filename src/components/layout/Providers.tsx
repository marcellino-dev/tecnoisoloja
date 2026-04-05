'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useCartStore } from '@/lib/store/cart';

// IMPORTANTE: este componente observa a sessão e sincroniza o dono do carrinho.
// Quando o usuário faz login, logout ou troca de conta, o carrinho é limpo
// automaticamente — impedindo que itens vazem entre contas diferentes.
function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const setOwner = useCartStore(state => state.setOwner);

  useEffect(() => {
    // Aguarda a sessão carregar antes de sincronizar
    if (status === 'loading') return;

    const userId = (session?.user as any)?.id ?? null;
    setOwner(userId);
  }, [session, status, setOwner]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* CartProvider precisa estar dentro do SessionProvider para acessar a sessão */}
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  );
}