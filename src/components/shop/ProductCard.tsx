'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: Props) {
  const addItem = useCartStore(s => s.addItem);
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;
    addItem(product);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="card-hover group flex flex-col animate-fade-in"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-dark-700 overflow-hidden">
        <Image
          src={product.images?.[0] || `https://via.placeholder.com/400x300/1a1a2e/ea580c?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && (
            <span className="badge bg-brand-600 text-white">-{discount}%</span>
          )}
          {product.featured && (
            <span className="badge bg-dark-700/90 text-brand-400 border border-brand-600/30">Destaque</span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-red-900/80 text-red-400">Sem estoque</span>
          )}
        </div>

        {/* Hover actions */}
        <div className="absolute inset-0 bg-dark-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="flex items-center gap-2 text-sm font-display font-600 text-white">
            <Eye className="w-4 h-4" /> Ver detalhes
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        {product.category && (
          <span className="text-xs font-mono text-dark-500 mb-1 tracking-wide uppercase">
            {product.category.name}
          </span>
        )}
        <h3 className="font-display font-600 text-white text-sm leading-snug line-clamp-2 mb-3 group-hover:text-brand-300 transition-colors flex-1">
          {product.name}
        </h3>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="font-display font-800 text-lg text-white">
              {formatPrice(product.price)}
            </div>
            {product.compare_price && (
              <div className="text-xs text-dark-500 line-through">
                {formatPrice(product.compare_price)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-500 disabled:bg-dark-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-display font-600 transition-all duration-200 hover:shadow-lg hover:shadow-brand-600/30 active:scale-95"
            title="Adicionar ao carrinho"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:block">Adicionar</span>
          </button>
        </div>

        {/* Stock indicator */}
        {product.stock > 0 && product.stock <= 10 && (
          <p className="text-xs text-yellow-500 mt-2">
            ⚠ Apenas {product.stock} em estoque
          </p>
        )}
      </div>
    </Link>
  );
}
