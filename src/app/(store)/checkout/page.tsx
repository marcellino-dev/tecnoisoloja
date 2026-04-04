'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';
import { ShippingAddress } from '@/types';
import { ArrowRight, Lock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

const INITIAL_ADDRESS: ShippingAddress = {
  name: '', email: '', phone: '', street: '', number: '',
  complement: '', district: '', city: '', state: '', postal_code: '',
};

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();
  const [address, setAddress] = useState<ShippingAddress>(INITIAL_ADDRESS);
  const [loading, setLoading] = useState(false);

  const cartTotal = total();

  if (status === 'unauthenticated') {
    return (
      <div className="py-20">
        <div className="container-custom max-w-md mx-auto text-center py-20">
          <Lock className="w-12 h-12 text-brand-500 mx-auto mb-4" />
          <h1 className="font-display font-800 text-2xl text-white mb-2">Faça login para continuar</h1>
          <p className="text-dark-400 mb-6">Você precisa estar logado para finalizar a compra.</p>
          <button onClick={() => signIn('google')} className="btn-primary mx-auto">
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20">
        <div className="container-custom max-w-md mx-auto text-center py-20">
          <h1 className="font-display font-800 text-2xl text-white mb-4">Carrinho vazio</h1>
          <Link href="/products" className="btn-primary">Ver Produtos</Link>
        </div>
      </div>
    );
  }

  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddress(a => ({ ...a, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shipping_address: address }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao criar pedido');

      clearCart();
      if (json.data.pagseguro_link) {
        window.location.href = json.data.pagseguro_link;
      } else {
        router.push(`/checkout/success?order=${json.data.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar pedido');
      setLoading(false);
    }
  };

  const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

  const InputField = ({ name, label, placeholder, type = 'text', required = true }: { name: keyof ShippingAddress; label: string; placeholder?: string; type?: string; required?: boolean }) => (
    <div>
      <label className="label">{label}{required && ' *'}</label>
      <input
        type={type} name={name} value={address[name]} onChange={handleField}
        placeholder={placeholder} required={required}
        className="input"
      />
    </div>
  );

  return (
    <div className="py-10">
      <div className="container-custom">
        <h1 className="section-title mb-8">Finalizar Pedido</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Shipping Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6">
                <h2 className="font-display font-700 text-white text-lg mb-5">Dados do Comprador</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField name="name"  label="Nome completo" placeholder="João da Silva" />
                  <InputField name="email" label="Email" type="email" placeholder="joao@email.com" />
                  <InputField name="phone" label="Telefone" placeholder="(11) 9 9999-9999" />
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-display font-700 text-white text-lg mb-5">Endereço de Entrega</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <InputField name="postal_code" label="CEP" placeholder="00000-000" />
                  </div>
                  <div className="sm:col-span-2">
                    <InputField name="street" label="Rua / Avenida" placeholder="Rua das Flores" />
                  </div>
                  <InputField name="number"     label="Número"      placeholder="123" />
                  <InputField name="complement" label="Complemento" placeholder="Apto 4B" required={false} />
                  <InputField name="district"   label="Bairro"      placeholder="Centro" />
                  <InputField name="city"       label="Cidade"      placeholder="São Paulo" />
                  <div>
                    <label className="label">Estado *</label>
                    <select name="state" value={address.state} onChange={handleField} required className="input">
                      <option value="">Selecione...</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="card p-6 sticky top-20">
                <h2 className="font-display font-700 text-white text-lg mb-5">Resumo</h2>
                <div className="space-y-3 text-sm mb-4">
                  {items.map(item => (
                    <div key={item.product.id} className="flex justify-between text-dark-400">
                      <span className="truncate max-w-[150px]">{item.product.name} ×{item.quantity}</span>
                      <span>{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dark-700 pt-4 mb-6">
                  <div className="flex justify-between font-display font-800 text-white text-xl">
                    <span>Total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-base">
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
                  ) : (
                    <><Lock className="w-5 h-5" /> Ir para Pagamento <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <p className="text-xs text-dark-500 text-center mt-3">
                  🔒 Pagamento 100% seguro via PagSeguro
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
