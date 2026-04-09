'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ShippingForm {
  name:        string;
  email:       string;
  phone:       string;
  postal_code: string;
  street:      string;
  number:      string;
  complement:  string;
  district:    string;
  city:        string;
  state:       string;
}

const EMPTY_FORM: ShippingForm = {
  name: '', email: '', phone: '', postal_code: '',
  street: '', number: '', complement: '', district: '', city: '', state: '',
};

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
];

export default function CheckoutPage() {
  const { data: session }              = useSession();
  const { items, total, clearCart }    = useCart();
  const router                         = useRouter();
  const [form, setForm]                = useState<ShippingForm>({
    ...EMPTY_FORM,
    name:  session?.user?.name  || '',
    email: session?.user?.email || '',
  });
  const [loading, setLoading]          = useState(false);
  const [cepLoading, setCepLoading]    = useState(false);

  const set = (field: keyof ShippingForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  // Busca endereco pelo CEP assim que o usuario digita os 8 digitos
  const handleCepChange = async (value: string) => {
    setForm(f => ({ ...f, postal_code: value }));
    const clean = value.replace(/\D/g, '');
    if (clean.length !== 8) return;

    setCepLoading(true);
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast.error('CEP nao encontrado');
        return;
      }
      setForm(f => ({
        ...f,
        postal_code: value,
        street:      data.logradouro || f.street,
        district:    data.bairro     || f.district,
        city:        data.localidade || f.city,
        state:       data.uf         || f.state,
      }));
    } catch {
      toast.error('Erro ao buscar CEP. Preencha o endereco manualmente.');
    } finally {
      setCepLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length)  { toast.error('Seu carrinho esta vazio'); return; }
    if (!session)       { toast.error('Faca login para continuar'); return; }

    setLoading(true);
    try {
      const res  = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ items, shipping_address: form }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Erro ao processar pedido');

      const url = process.env.NODE_ENV === 'production'
        ? json.data.init_point
        : json.data.sandbox_init_point;

      clearCart();
      window.location.href = url;

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="container-custom py-24 text-center">
        <p className="text-gray-500 mb-4">Seu carrinho esta vazio.</p>
        <button
          onClick={() => router.push('/products')}
          className="px-6 py-3 bg-brand-600 text-white rounded-xl font-600 text-sm"
        >
          Ver produtos
        </button>
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      <h1 className="font-display font-800 text-2xl text-gray-900 mb-8">Finalizar Pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">

          {/* Dados do comprador */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-700 text-gray-900 mb-4">Dados do comprador</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-600 text-gray-600 mb-1.5">Nome completo</label>
                <input
                  required
                  value={form.name}
                  onChange={set('name')}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">E-mail</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">Telefone</label>
                <input
                  required
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Endereco de entrega */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-700 text-gray-900 mb-4">Endereco de entrega</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">
                  CEP {cepLoading && <span className="text-brand-500 font-400">buscando...</span>}
                </label>
                <input
                  required
                  value={form.postal_code}
                  onChange={e => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-600 text-gray-600 mb-1.5">Rua</label>
                <input
                  required
                  value={form.street}
                  onChange={set('street')}
                  placeholder="Preenchido automaticamente pelo CEP"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">Numero</label>
                <input
                  required
                  value={form.number}
                  onChange={set('number')}
                  placeholder="Ex: 340"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">Complemento</label>
                <input
                  value={form.complement}
                  onChange={set('complement')}
                  placeholder="Apto, sala, bloco..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">Bairro</label>
                <input
                  required
                  value={form.district}
                  onChange={set('district')}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">Cidade</label>
                <input
                  required
                  value={form.city}
                  onChange={set('city')}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">Estado</label>
                <select
                  required
                  value={form.state}
                  onChange={set('state')}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-all"
                >
                  <option value="">Selecione</option>
                  {ESTADOS.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cepLoading}
            className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-700 text-base rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Continuar para pagamento'}
          </button>
        </form>

        {/* Resumo do pedido */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
            <h2 className="font-700 text-gray-900 mb-4">Resumo do pedido</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-700 line-clamp-1 flex-1 mr-2">
                    {item.product.name} <span className="text-gray-400">x{item.quantity}</span>
                  </span>
                  <span className="font-600 text-gray-900 shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between">
              <span className="font-700 text-gray-900">Total</span>
              <span className="font-800 text-xl text-brand-600">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Voce sera redirecionado ao Mercado Pago para escolher a forma de pagamento.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
