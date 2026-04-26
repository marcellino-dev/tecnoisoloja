'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Zap, LogIn } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { useSession } from 'next-auth/react';
import { Product } from '@/types';
import toast from 'react-hot-toast';

export function AddToCartSection({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore(s => s.addItem);
  const { data: session, status } = useSession();

  // Redireciona para login se não estiver autenticado
  // callbackUrl garante que o usuário volta para a página do produto após login
  const requireAuth = (action: () => void) => {
    if (status === 'loading') return; // aguarda sessão carregar
    if (!session) {
      const currentPath = window.location.pathname + window.location.search;
      toast(`Faça login para continuar`, {
        icon: '🔒',
        style: {
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          fontSize: 13,
        },
      });
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`;
      return;
    }
    action();
  };

  const handleAdd = () => {
    requireAuth(() => {
      setAdding(true);
      addItem(product, qty);
      toast.success(`${qty}× ${product.name} adicionado!`, {
        style: {
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          fontSize: 13,
        },
        iconTheme: { primary: '#E63946', secondary: '#fff' },
      });
      setTimeout(() => setAdding(false), 800);
    });
  };

  const handleBuyNow = () => {
    requireAuth(() => {
      addItem(product, qty);
      window.location.href = '/checkout';
    });
  };

  if (product.stock === 0) {
    return (
      <div style={{
        padding: '16px 20px',
        borderRadius: 8,
        background: 'rgba(230,57,70,0.06)',
        border: '1px solid rgba(230,57,70,0.2)',
        display: 'flex', alignItems: 'center', gap: 10,
        color: '#E63946', fontSize: 13, fontWeight: 600,
      }}>
        <span style={{ fontSize: 16 }}>⊘</span>
        Produto fora de estoque
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Seletor de quantidade */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Quantidade:</span>

        <div style={{
          display: 'flex', alignItems: 'center',
          border: '1.5px solid #e5e7eb',
          borderRadius: 8, overflow: 'hidden',
          background: '#fff',
        }}>
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b7280', transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb';
              (e.currentTarget as HTMLButtonElement).style.color = '#111';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
              (e.currentTarget as HTMLButtonElement).style.color = '#6b7280';
            }}
          >
            <Minus style={{ width: 14, height: 14 }} />
          </button>

          <span style={{
            width: 44, textAlign: 'center',
            fontFamily: 'var(--font-mono)', fontWeight: 700,
            fontSize: 15, color: '#111',
            borderLeft: '1px solid #f0f0f0',
            borderRight: '1px solid #f0f0f0',
            lineHeight: '36px',
          }}>
            {qty}
          </span>

          <button
            onClick={() => setQty(q => Math.min(product.stock, q + 1))}
            style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b7280', transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb';
              (e.currentTarget as HTMLButtonElement).style.color = '#111';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
              (e.currentTarget as HTMLButtonElement).style.color = '#6b7280';
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />
          </button>
        </div>

        <span style={{ fontSize: 12, color: '#9ca3af' }}>
          {product.stock} disponíveis
        </span>
      </div>

      {/* Botão Adicionar ao carrinho */}
      <button
        onClick={handleAdd}
        disabled={status === 'loading'}
        style={{
          width: '100%', padding: '14px 24px',
          background: adding ? '#374151' : '#0a0a0a',
          border: 'none', borderRadius: 8, cursor: status === 'loading' ? 'wait' : 'pointer',
          color: '#fff', fontSize: 14, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          letterSpacing: '0.02em',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
          transform: adding ? 'scale(0.98)' : 'scale(1)',
          opacity: status === 'loading' ? 0.7 : 1,
        }}
        onMouseEnter={e => {
          if (!adding && status !== 'loading')
            (e.currentTarget as HTMLButtonElement).style.background = '#1f2937';
        }}
        onMouseLeave={e => {
          if (!adding && status !== 'loading')
            (e.currentTarget as HTMLButtonElement).style.background = '#0a0a0a';
        }}
      >
        {session ? (
          <ShoppingCart style={{ width: 18, height: 18 }} />
        ) : (
          <LogIn style={{ width: 18, height: 18 }} />
        )}
        {adding ? 'Adicionado! ✓' : session ? 'Adicionar ao Carrinho' : 'Entrar para Adicionar'}
      </button>

      {/* Botão Comprar agora */}
      <button
        onClick={handleBuyNow}
        disabled={status === 'loading'}
        style={{
          width: '100%', padding: '14px 24px',
          background: '#E63946',
          border: 'none', borderRadius: 8, cursor: status === 'loading' ? 'wait' : 'pointer',
          color: '#fff', fontSize: 14, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          letterSpacing: '0.02em',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 20px rgba(230,57,70,0.3)',
          opacity: status === 'loading' ? 0.7 : 1,
        }}
        onMouseEnter={e => {
          if (status !== 'loading') {
            (e.currentTarget as HTMLButtonElement).style.background = '#c62d39';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(230,57,70,0.4)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#E63946';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(230,57,70,0.3)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        }}
      >
        <Zap style={{ width: 16, height: 16 }} />
        {session ? 'Comprar Agora' : 'Entrar para Comprar'}
      </button>

      {/* Garantias */}
      <div style={{
        display: 'flex', gap: 16, flexWrap: 'wrap',
        padding: '14px 0', borderTop: '1px solid #f3f4f6', marginTop: 4,
      }}>
        {[
          { icon: '🔒', text: 'Pagamento seguro' },
          { icon: '🚚', text: 'Frete grátis +R$500' },
          { icon: '↩️', text: '30 dias p/ devolução' },
        ].map(g => (
          <div key={g.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>{g.icon}</span>
            <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{g.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}