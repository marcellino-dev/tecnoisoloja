'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQty, total } = useCartStore();
  const cartTotal = total();

  if (items.length === 0) {
    return (
      <div className="py-20">
        <div className="container-custom">
          <div className="max-w-md mx-auto text-center py-20">
            <ShoppingCart className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h1 className="font-display font-800 text-2xl text-white mb-2">Carrinho vazio</h1>
            <p className="text-dark-400 mb-8">Adicione produtos ao carrinho para continuar.</p>
            <Link href="/products" className="btn-primary">
              <ArrowLeft className="w-4 h-4" /> Explorar Produtos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container-custom">
        <h1 className="section-title mb-8">Carrinho de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.product.id} className="card p-4 flex gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-dark-700 shrink-0">
                  <Image
                    src={item.product.images?.[0] || `https://via.placeholder.com/80x80/1a1a2e/ea580c?text=${encodeURIComponent(item.product.name[0])}`}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-display font-600 text-white hover:text-brand-400 transition-colors line-clamp-2 text-sm"
                  >
                    {item.product.name}
                  </Link>
                  <p className="font-display font-800 text-brand-400 mt-1">
                    {formatPrice(item.product.price)}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty */}
                    <div className="flex items-center bg-dark-700 border border-dark-600 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQty(item.product.id, item.quantity - 1)}
                        className="px-2 py-1.5 hover:bg-dark-600 text-dark-300 hover:text-white transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 py-1.5 font-mono font-700 text-white text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-2 py-1.5 hover:bg-dark-600 disabled:opacity-50 text-dark-300 hover:text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-display font-700 text-white text-sm">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1.5 text-dark-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link href="/products" className="btn-ghost text-sm mt-2">
              <ArrowLeft className="w-4 h-4" /> Continuar comprando
            </Link>
          </div>

          {/* Summary */}
          <div>
            <div className="card p-6 sticky top-20">
              <h2 className="font-display font-700 text-white text-lg mb-5">Resumo do Pedido</h2>

              <div className="space-y-3 text-sm">
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between text-dark-400">
                    <span className="truncate max-w-[150px]">{item.product.name} ×{item.quantity}</span>
                    <span>{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dark-700 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-display font-700 text-white">Total</span>
                  <span className="font-display font-800 text-2xl text-white">{formatPrice(cartTotal)}</span>
                </div>
                <p className="text-xs text-dark-500 mt-1">+ frete calculado no checkout</p>
              </div>

              <Link href="/checkout" className="btn-primary w-full justify-center mt-5 py-4">
                Finalizar Pedido <ArrowRight className="w-5 h-5" />
              </Link>

              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-xs text-dark-500">🔒 Pagamento seguro via PagSeguro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
