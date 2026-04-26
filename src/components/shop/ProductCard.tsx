'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, Zap, Star, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface Props {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: Props) {
  const addItem = useCartStore(s => s.addItem);
  const [hovered, setHovered] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const { data: session, status } = useSession();

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;

  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 10;

  // Redireciona para login se não autenticado, com retorno à página atual
  const requireAuth = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    if (status === 'loading') return;
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

  const handleAddToCart = (e: React.MouseEvent) => {
    requireAuth(e, () => {
      if (outOfStock) return;
      setAddingCart(true);
      addItem(product);
      toast.success(`${product.name} adicionado!`, {
        iconTheme: { primary: '#E63946', secondary: '#fff' },
      });
      setTimeout(() => setAddingCart(false), 600);
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    requireAuth(e, () => {
      if (outOfStock) return;
      addItem(product);
      window.location.href = '/checkout';
    });
  };

  const [int, dec] = product.price.toFixed(2).replace('.', ',').split(',');

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: hovered ? '#E63946' : '#e5e7eb',
        boxShadow: hovered
          ? '0 12px 40px rgba(230,57,70,0.12), 0 2px 8px rgba(0,0,0,0.08)'
          : '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        animationDelay: `${index * 0.06}s`,
        position: 'relative',
      }}
    >
      {/* Badges */}
      {discount && (
        <div style={{
          position: 'absolute', top: 12, left: 12, zIndex: 10,
          background: '#E63946', color: '#fff',
          fontSize: 11, fontWeight: 700,
          padding: '3px 8px', borderRadius: 4,
          letterSpacing: '0.03em',
          fontFamily: 'var(--font-mono)',
        }}>
          -{discount}%
        </div>
      )}

      {product.featured && !discount && (
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          background: '#0a0a0a', color: '#fff',
          fontSize: 10, fontWeight: 600,
          padding: '3px 8px', borderRadius: 4,
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          DESTAQUE
        </div>
      )}

      {lowStock && !outOfStock && (
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          background: '#fff8f8', color: '#E63946', border: '1px solid #fecaca',
          fontSize: 10, fontWeight: 600,
          padding: '3px 8px', borderRadius: 4,
        }}>
          Últimas unidades
        </div>
      )}

      {/* Imagem */}
      <div style={{
        position: 'relative',
        aspectRatio: '1/1',
        background: '#f9fafb',
        overflow: 'hidden',
        opacity: outOfStock ? 0.5 : 1,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: hovered
            ? 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(230,57,70,0.04), transparent)'
            : 'transparent',
          transition: 'all 0.4s ease',
          zIndex: 1,
        }} />
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain p-4"
            style={{
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
            }}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#d1d5db', fontSize: 12 }}>
            Sem imagem
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div style={{ padding: '14px 14px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>

        {/* Categoria */}
        {product.category && (
          <span style={{
            fontSize: 10, color: '#E63946',
            fontWeight: 600, letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
          }}>
            {product.category.name}
          </span>
        )}

        {/* Nome */}
        <p style={{
          fontSize: 13.5, color: '#111',
          lineHeight: 1.45, margin: 0, flex: 1,
          fontWeight: 500,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.name}
        </p>

        {/* Estrelas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[1,2,3,4,5].map(i => (
            <Star key={i} style={{ width: 11, height: 11, fill: i <= 4 ? '#E63946' : 'none', color: '#E63946' }} />
          ))}
          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 2 }}>4.5</span>
        </div>

        {/* Preço — usando vermelho do padrão, não laranja */}
        <div style={{ marginTop: 2 }}>
          {product.compare_price && (
            <span style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>
              R$ {product.compare_price.toFixed(2).replace('.', ',')}
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, lineHeight: 1 }}>
            <span style={{ fontSize: 12, color: '#111', fontWeight: 500 }}>R$ </span>
            <span style={{ fontSize: 26, color: '#111', fontWeight: 700, letterSpacing: '-0.03em' }}>{int}</span>
            <span style={{ fontSize: 14, color: '#111', fontWeight: 600 }}>,{dec}</span>
          </div>
          <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>12x sem juros</p>
        </div>

        {/* Status */}
        {outOfStock ? (
          <p style={{ fontSize: 11, color: '#E63946', fontWeight: 600, margin: 0 }}>Indisponível</p>
        ) : lowStock ? (
          <p style={{ fontSize: 11, color: '#E63946', fontWeight: 600, margin: 0 }}>Restam {product.stock}</p>
        ) : (
          <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 500, margin: 0 }}>● Em estoque</p>
        )}

        {/* Botão Adicionar ao Carrinho */}
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          style={{
            marginTop: 6,
            width: '100%',
            padding: '9px 0',
            background: outOfStock ? '#f3f4f6' : '#0a0a0a',
            border: 'none',
            borderRadius: 6,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: outOfStock ? 'not-allowed' : 'pointer',
            color: outOfStock ? '#9ca3af' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.2s ease',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => { if (!outOfStock) (e.currentTarget as HTMLButtonElement).style.background = '#1f2937'; }}
          onMouseLeave={e => { if (!outOfStock) (e.currentTarget as HTMLButtonElement).style.background = '#0a0a0a'; }}
        >
          {!outOfStock && !session ? (
            <LogIn style={{ width: 14, height: 14 }} />
          ) : (
            <ShoppingCart style={{ width: 14, height: 14 }} />
          )}
          {outOfStock ? 'Esgotado' : addingCart ? 'Adicionado!' : session ? 'Adicionar' : 'Entrar'}
        </button>

        {/* Botão Comprar Agora */}
        {!outOfStock && (
          <button
            onClick={handleBuyNow}
            style={{
              width: '100%',
              padding: '9px 0',
              background: '#E63946',
              border: 'none',
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.2s ease',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#c62d39'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#E63946'}
          >
            <Zap style={{ width: 13, height: 13 }} />
            {session ? 'Comprar agora' : 'Entrar p/ comprar'}
          </button>
        )}
      </div>
    </Link>
  );
}