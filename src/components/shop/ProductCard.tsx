'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
  index?: number;
}

function StarRating({ rating = 4.2, count = 0 }: { rating?: number; count?: number }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <span style={{ color: '#f90', fontSize: 13, letterSpacing: -1 }}>
        {'★'.repeat(full)}
        {half ? '½' : ''}
        {'☆'.repeat(empty)}
      </span>
      {count > 0 && (
        <span style={{ fontSize: 12, color: '#007185' }}>({count})</span>
      )}
    </div>
  );
}

export function ProductCard({ product, index = 0 }: Props) {
  const addItem = useCartStore(s => s.addItem);

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;

  const outOfStock = product.stock === 0;
  const lowStock   = product.stock > 0 && product.stock <= 10;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    addItem(product);
    toast.success(`${product.name} adicionado!`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    addItem(product);
    window.location.href = '/checkout';
  };

  // Formata preço no estilo Amazon: "R$ 399,90" → parte inteira + centavos separados
  const formatAmazonPrice = (value: number) => {
    const [int, dec] = value.toFixed(2).replace('.', ',').split(',');
    return { int, dec };
  };

  const { int, dec } = formatAmazonPrice(product.price);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      style={{
        background: 'white',
        border: '0.5px solid #ddd',
        borderRadius: 4,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.15s',
        animationDelay: `${index * 0.06}s`,
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#f90')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#ddd')}
    >
      {/* Imagem */}
      <div style={{
        position: 'relative',
        aspectRatio: '1/1',
        background: '#f7f8f8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        opacity: outOfStock ? 0.5 : 1,
      }}>
        {discount && (
          <span style={{
            position: 'absolute', top: 8, left: 8, zIndex: 10,
            background: '#CC0C39', color: '#fff',
            fontSize: 11, fontWeight: 500,
            padding: '2px 6px', borderRadius: 2,
          }}>
            -{discount}%
          </span>
        )}
        {product.featured && !discount && (
          <span style={{
            position: 'absolute', top: 8, right: 8, zIndex: 10,
            background: '#fff', border: '0.5px solid #ddd',
            color: '#555', fontSize: 11,
            padding: '2px 6px', borderRadius: 2,
          }}>
            Destaque
          </span>
        )}
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain p-3"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div style={{ color: '#ccc', fontSize: 12 }}>Sem imagem</div>
        )}
      </div>

      {/* Conteúdo */}
      <div style={{
        padding: '10px 12px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
      }}>
        {/* Categoria */}
        {product.category && (
          <span style={{ fontSize: 11, color: '#007185' }}>
            {product.category.name}
          </span>
        )}

        {/* Nome */}
        <p style={{
          fontSize: 13, color: '#0F1111',
          lineHeight: 1.4, margin: 0, flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.name}
        </p>

        {/* Estrelas */}
      <StarRating rating={4.5} count={0} />

        {/* Preço */}
        <div>
          {product.compare_price && (
            <div style={{ fontSize: 11, color: '#555' }}>
              R$ <s>{product.compare_price.toFixed(2).replace('.', ',')}</s>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <span style={{ fontSize: 11, color: '#0F1111' }}>R$ </span>
            <span style={{ fontSize: 22, fontWeight: 500, color: '#0F1111', lineHeight: 1.1 }}>{int}</span>
            <span style={{ fontSize: 13, color: '#0F1111' }}>,{dec}</span>
          </div>
          <p style={{ fontSize: 11, color: '#555', margin: 0 }}>em 12x sem juros</p>
        </div>

        {/* Status estoque */}
        {outOfStock ? (
          <p style={{ fontSize: 12, color: '#CC0C39', margin: 0 }}>Indisponível</p>
        ) : lowStock ? (
          <p style={{ fontSize: 12, color: '#CC0C39', margin: 0 }}>
            Restam apenas {product.stock}
          </p>
        ) : (
          <p style={{ fontSize: 12, color: '#007600', margin: 0 }}>Em estoque</p>
        )}

        <p style={{ fontSize: 11, color: '#555', margin: 0 }}>
          Frete GRÁTIS acima de R$500
        </p>

        {/* Botões */}
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          style={{
            marginTop: 4,
            width: '100%',
            padding: '7px 0',
            background: outOfStock ? '#e9e9e9' : '#FFD814',
            border: `0.5px solid ${outOfStock ? '#ccc' : '#FCD200'}`,
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 500,
            cursor: outOfStock ? 'not-allowed' : 'pointer',
            color: outOfStock ? '#888' : '#0F1111',
          }}
          onMouseEnter={e => { if (!outOfStock) (e.currentTarget.style.background = '#F7CA00'); }}
          onMouseLeave={e => { if (!outOfStock) (e.currentTarget.style.background = '#FFD814'); }}
        >
          {outOfStock ? 'Esgotado' : 'Adicionar ao carrinho'}
        </button>

        {!outOfStock && (
          <button
            onClick={handleBuyNow}
            style={{
              width: '100%',
              padding: '7px 0',
              background: '#FFA41C',
              border: '0.5px solid #FF8F00',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              color: '#0F1111',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FA8900')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FFA41C')}
          >
            Comprar agora
          </button>
        )}
      </div>
    </Link>
  );
}