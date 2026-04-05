// Hook de acesso ao carrinho para uso nos componentes de checkout e paginas da loja.
// Reexporta o store centralizado evitando imports diretos espalhados pelo projeto.
import { useCartStore } from '@/lib/store/cart';

export function useCart() {
  const items     = useCartStore(s => s.items);
  const total     = useCartStore(s => s.total());
  const count     = useCartStore(s => s.count());
  const clearCart = useCartStore(s => s.clearCart);
  const addItem   = useCartStore(s => s.addItem);
  const removeItem = useCartStore(s => s.removeItem);
  const updateQty  = useCartStore(s => s.updateQty);

  return { items, total, count, clearCart, addItem, removeItem, updateQty };
}