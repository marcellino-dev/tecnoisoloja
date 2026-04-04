'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { Product } from '@/types';
import toast from 'react-hot-toast';

export function AddToCartSection({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore(s => s.addItem);

  const handleAdd = () => {
    addItem(product, qty);
    toast.success(`${qty}x ${product.name} adicionado ao carrinho!`);
  };

  if (product.stock === 0) {
    return (
      <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30 text-red-400 text-sm font-display font-500">
        ❌ Produto fora de estoque
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Qty selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-dark-400">Quantidade:</span>
        <div className="flex items-center bg-dark-700 border border-dark-600 rounded-lg overflow-hidden">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="px-3 py-2 hover:bg-dark-600 text-dark-300 hover:text-white transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 font-mono font-700 text-white min-w-[3rem] text-center">{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(product.stock, q + 1))}
            className="px-3 py-2 hover:bg-dark-600 text-dark-300 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-dark-500">{product.stock} disponíveis</span>
      </div>

      <button onClick={handleAdd} className="btn-primary w-full justify-center py-4 text-base">
        <ShoppingCart className="w-5 h-5" />
        Adicionar ao Carrinho
      </button>
    </div>
  );
}
