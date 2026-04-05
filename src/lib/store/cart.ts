import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  // ID do usuário dono deste carrinho — usado para detectar troca de conta
  ownerId: string | null;
  addItem:    (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQty:  (productId: string, quantity: number) => void;
  clearCart:  () => void;
  // Chamado pelo CartProvider quando o usuário muda (login/logout/troca de conta)
  setOwner:   (userId: string | null) => void;
  total:      () => number;
  count:      () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:   [],
      ownerId: null,

      // IMPORTANTE: ao trocar de usuário, limpa o carrinho antes de associar ao novo dono.
      // Isso impede que carrinhos vazem entre contas diferentes no mesmo navegador.
      setOwner: (userId) => {
        const current = get().ownerId;
        if (current !== userId) {
          set({ items: [], ownerId: userId });
        }
      },

      addItem: (product, quantity = 1) => {
        set(state => {
          const existing = state.items.find(i => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.product.id === product.id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity: Math.min(quantity, product.stock) }] };
        });
      },

      removeItem: (productId) =>
        set(state => ({ items: state.items.filter(i => i.product.id !== productId) })),

      updateQty: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set(state => ({
          items: state.items.map(i =>
            i.product.id === productId
              ? { ...i, quantity: Math.min(quantity, i.product.stock) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),

      count: () =>
        get().items.reduce((acc, i) => acc + i.quantity, 0),
    }),
    { name: 'tecnoiso-cart' }
  )
);