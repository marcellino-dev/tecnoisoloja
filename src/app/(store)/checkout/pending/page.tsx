'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SavedAddress {
  id:           string;
  label:        string | null;
  zip:          string;
  street:       string;
  number:       string;
  complement:   string | null;
  neighborhood: string;
  city:         string;
  state:        string;
  is_default:   boolean;
}

interface AddressFormState {
  zip:          string;
  street:       string;
  number:       string;
  complement:   string;
  neighborhood: string;
  city:         string;
  state:        string;
}

const EMPTY_ADDRESS: AddressFormState = {
  zip: '', street: '', number: '', complement: '',
  neighborhood: '', city: '', state: '',
};

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
];

// ─── Address Card ─────────────────────────────────────────────────────────────

function AddressCard({
  address, selected, onSelect, onEdit, onDelete,
}: {
  address:  SavedAddress;
  selected: boolean;
  onSelect: () => void;
  onEdit:   () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className="relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200"
      style={{
        borderColor:     selected ? '#E63946' : '#e4e3e0',
        backgroundColor: selected ? '#fff5f5' : '#ffffff',
      }}
    >
      {/* Radio indicator */}
      <div
        className="absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
        style={{
          borderColor:     selected ? '#E63946' : '#d1d5db',
          backgroundColor: selected ? '#E63946' : 'transparent',
        }}
      >
        {selected && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <div className="pr-8">
        <div className="flex items-center gap-2 mb-1">
          {/* Label icon */}
          <svg className="w-3.5 h-3.5 shrink-0" style={{ color: '#E63946' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <p className="font-700 text-sm text-gray-900">{address.label || 'Endereço'}</p>
          {address.is_default && (
            <span
              className="text-[10px] font-700 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#fff5f5', color: '#E63946' }}
            >
              Padrão
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mt-0.5">
          {address.street}, {address.number}
          {address.complement ? ` — ${address.complement}` : ''}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {address.neighborhood} · {address.city}/{address.state}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">CEP {address.zip}</p>
      </div>

      <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onEdit(); }}
          className="text-xs font-600 transition-colors"
          style={{ color: '#E63946' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#c62d39')}
          onMouseLeave={e => (e.currentTarget.style.color = '#E63946')}
        >
          Editar
        </button>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="text-xs font-600 text-red-400 hover:text-red-600 transition-colors"
        >
          Remover
        </button>
      </div>
    </div>
  );
}

// ─── Input classes ────────────────────────────────────────────────────────────

const inputCls = "w-full px-4 py-2.5 bg-white border border-[#e4e3e0] rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E63946] transition-all duration-200";
const labelCls = "block text-xs font-600 text-gray-600 mb-1.5";

// ─── Address Form Fields ──────────────────────────────────────────────────────

function AddressFormFields({
  form, setForm, cepLoading, handleCepChange,
  label, setLabel, showLabel,
}: {
  form:            AddressFormState;
  setForm:         React.Dispatch<React.SetStateAction<AddressFormState>>;
  cepLoading:      boolean;
  handleCepChange: (v: string) => void;
  label?:          string;
  setLabel?:       (v: string) => void;
  showLabel?:      boolean;
}) {
  const set = (field: keyof AddressFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

      {showLabel && setLabel && (
        <div className="sm:col-span-2">
          <label className={labelCls}>
            Identificação <span className="font-400 text-gray-400">(ex: Casa, Trabalho)</span>
          </label>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Casa"
            className={inputCls}
          />
        </div>
      )}

      <div>
        <label className={labelCls}>
          CEP {cepLoading && <span className="font-400" style={{ color: '#E63946' }}>buscando...</span>}
        </label>
        <input
          required
          value={form.zip}
          onChange={e => handleCepChange(e.target.value)}
          placeholder="00000-000"
          maxLength={9}
          className={inputCls}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={labelCls}>Rua</label>
        <input
          required value={form.street} onChange={set('street')}
          placeholder="Preenchido automaticamente pelo CEP"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Número</label>
        <input required value={form.number} onChange={set('number')} placeholder="Ex: 340" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Complemento</label>
        <input value={form.complement} onChange={set('complement')} placeholder="Apto, sala, bloco..." className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Bairro</label>
        <input required value={form.neighborhood} onChange={set('neighborhood')} className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Cidade</label>
        <input required value={form.city} onChange={set('city')} className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Estado</label>
        <select required value={form.state} onChange={set('state')} className={inputCls}>
          <option value="">Selecione</option>
          {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type AddressMode = 'list' | 'new' | 'editing';

export default function CheckoutPage() {
  const { data: session }           = useSession();
  const { items, total, clearCart } = useCart();
  const router                      = useRouter();

  const [buyer, setBuyer] = useState({
    name:  session?.user?.name  ?? '',
    email: session?.user?.email ?? '',
    phone: '',
  });

  const [addresses, setAddresses]     = useState<SavedAddress[]>([]);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [addressMode, setAddressMode] = useState<AddressMode>('list');
  const [editingId, setEditingId]     = useState<string | null>(null);

  const [addrForm, setAddrForm]       = useState<AddressFormState>({ ...EMPTY_ADDRESS });
  const [addrLabel, setAddrLabel]     = useState('Casa');
  const [makeDefault, setMakeDefault] = useState(false);

  const [loading, setLoading]         = useState(false);
  const [cepLoading, setCepLoading]   = useState(false);

  // ── Fetch addresses ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    fetch('/api/addresses')
      .then(r => r.json())
      .then((data: SavedAddress[]) => {
        setAddresses(data ?? []);
        const def = data?.find(a => a.is_default) ?? data?.[0];
        if (def) setSelectedId(def.id);
        if (!data?.length) setAddressMode('new');
      })
      .catch(() => setAddressMode('new'));
  }, [session]);

  // ── CEP lookup ─────────────────────────────────────────────────────────────
  const handleCepChange = async (value: string) => {
    setAddrForm(f => ({ ...f, zip: value }));
    const clean = value.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) { toast.error('CEP não encontrado'); return; }
      setAddrForm(f => ({
        ...f, zip: value,
        street:       data.logradouro || f.street,
        neighborhood: data.bairro     || f.neighborhood,
        city:         data.localidade || f.city,
        state:        data.uf         || f.state,
      }));
    } catch {
      toast.error('Erro ao buscar CEP. Preencha manualmente.');
    } finally {
      setCepLoading(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const startEdit = (addr: SavedAddress) => {
    setEditingId(addr.id);
    setAddrLabel(addr.label || 'Casa');
    setMakeDefault(addr.is_default);
    setAddrForm({
      zip: addr.zip, street: addr.street, number: addr.number,
      complement: addr.complement ?? '', neighborhood: addr.neighborhood,
      city: addr.city, state: addr.state,
    });
    setAddressMode('editing');
  };

  // ── Save new ───────────────────────────────────────────────────────────────
  const saveNew = async () => {
    if (!addrForm.street || !addrForm.number || !addrForm.city) {
      toast.error('Preencha todos os campos obrigatórios'); return;
    }
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: addrLabel || 'Casa', ...addrForm, is_default: makeDefault }),
      });
      if (!res.ok) throw new Error();
      const saved: SavedAddress = await res.json();
      setAddresses(prev =>
        makeDefault ? [...prev.map(a => ({ ...a, is_default: false })), saved] : [...prev, saved]
      );
      setSelectedId(saved.id);
      setAddressMode('list');
      toast.success('Endereço salvo!');
    } catch { toast.error('Erro ao salvar endereço'); }
  };

  // ── Save edit ──────────────────────────────────────────────────────────────
  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`/api/addresses/${editingId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: addrLabel, ...addrForm, is_default: makeDefault }),
      });
      if (!res.ok) throw new Error();
      const updated: SavedAddress = await res.json();
      setAddresses(prev => prev.map(a =>
        a.id === updated.id ? updated : makeDefault ? { ...a, is_default: false } : a
      ));
      setSelectedId(updated.id);
      cancelForm();
      toast.success('Endereço atualizado!');
    } catch { toast.error('Erro ao atualizar endereço'); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteAddress = async (id: string) => {
    try {
      await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      setAddresses(prev => {
        const next = prev.filter(a => a.id !== id);
        if (selectedId === id) setSelectedId(next[0]?.id ?? null);
        if (next.length === 0) setAddressMode('new');
        return next;
      });
      toast.success('Endereço removido');
    } catch { toast.error('Erro ao remover endereço'); }
  };

  // ── Cancel form ────────────────────────────────────────────────────────────
  const cancelForm = () => {
    setAddrForm({ ...EMPTY_ADDRESS });
    setAddrLabel('Casa');
    setMakeDefault(false);
    setEditingId(null);
    setAddressMode('list');
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) { toast.error('Seu carrinho está vazio'); return; }
    if (!session)      { toast.error('Faça login para continuar'); return; }

    let shipping: AddressFormState | null = null;
    if (addressMode === 'list') {
      const sel = addresses.find(a => a.id === selectedId);
      if (!sel) { toast.error('Selecione um endereço de entrega'); return; }
      shipping = {
        zip: sel.zip, street: sel.street, number: sel.number,
        complement: sel.complement ?? '', neighborhood: sel.neighborhood,
        city: sel.city, state: sel.state,
      };
    } else {
      shipping = addrForm;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shipping_address: { ...buyer, ...shipping } }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao processar pedido');
      const url = process.env.NODE_ENV === 'production'
        ? json.data.init_point : json.data.sandbox_init_point;
      clearCart();
      window.location.href = url;
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (!items.length) {
    return (
      <div className="container-custom py-24 text-center">
        <p className="text-gray-500 mb-4">Seu carrinho está vazio.</p>
        <button onClick={() => router.push('/products')} className="btn-primary px-6 py-3 text-sm rounded-lg">
          Ver produtos
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="container-custom py-10">
      <h1 className="font-display font-800 text-2xl text-gray-900 mb-8">Finalizar Pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">

          {/* ── Dados do comprador ── */}
          <div className="bg-white rounded-xl border border-[#e4e3e0] p-6">
            <h2 className="font-700 text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full text-white text-xs font-700 flex items-center justify-center" style={{ backgroundColor: '#E63946' }}>1</span>
              Dados do comprador
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Nome completo</label>
                <input required value={buyer.name}
                  onChange={e => setBuyer(b => ({ ...b, name: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>E-mail</label>
                <input required type="email" value={buyer.email}
                  onChange={e => setBuyer(b => ({ ...b, email: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Telefone</label>
                <input required value={buyer.phone} placeholder="(00) 00000-0000"
                  onChange={e => setBuyer(b => ({ ...b, phone: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* ── Endereço de entrega ── */}
          <div className="bg-white rounded-xl border border-[#e4e3e0] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-700 text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full text-white text-xs font-700 flex items-center justify-center" style={{ backgroundColor: '#E63946' }}>2</span>
                Endereço de entrega
              </h2>
              {addressMode !== 'list' && addresses.length > 0 && (
                <button type="button" onClick={cancelForm}
                  className="text-xs font-600 flex items-center gap-1 transition-colors"
                  style={{ color: '#E63946' }}
                >
                  ← Endereços salvos
                </button>
              )}
            </div>

            {/* LIST */}
            {addressMode === 'list' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map(addr => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    selected={selectedId === addr.id}
                    onSelect={() => setSelectedId(addr.id)}
                    onEdit={() => startEdit(addr)}
                    onDelete={() => deleteAddress(addr.id)}
                  />
                ))}

                {/* Add new button */}
                <button
                  type="button"
                  onClick={() => { setAddrForm({ ...EMPTY_ADDRESS }); setAddrLabel('Casa'); setAddressMode('new'); }}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-all duration-200 min-h-[130px] group"
                  style={{ borderColor: '#e4e3e0', color: '#9ca3a8' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#E63946';
                    (e.currentTarget as HTMLElement).style.color = '#E63946';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#e4e3e0';
                    (e.currentTarget as HTMLElement).style.color = '#9ca3a8';
                  }}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-xs font-600">Adicionar novo endereço</span>
                </button>
              </div>
            )}

            {/* NEW / EDITING */}
            {(addressMode === 'new' || addressMode === 'editing') && (
              <div className="space-y-4">
                <AddressFormFields
                  form={addrForm} setForm={setAddrForm}
                  cepLoading={cepLoading} handleCepChange={handleCepChange}
                  showLabel label={addrLabel} setLabel={setAddrLabel}
                />

                {/* Default toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div
                    onClick={() => setMakeDefault(v => !v)}
                    className="w-10 h-5 rounded-full flex items-center transition-colors duration-200 cursor-pointer"
                    style={{ backgroundColor: makeDefault ? '#E63946' : '#e4e3e0' }}
                  >
                    <div
                      className="w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 mx-0.5"
                      style={{ transform: makeDefault ? 'translateX(20px)' : 'translateX(0)' }}
                    />
                  </div>
                  <span className="text-xs font-600 text-gray-600">Usar como endereço padrão</span>
                </label>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={addressMode === 'new' ? saveNew : saveEdit}
                    className="btn-primary px-5 py-2.5 text-xs rounded-lg"
                  >
                    {addressMode === 'new' ? 'Salvar endereço' : 'Salvar alterações'}
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={cancelForm}
                      className="btn-secondary px-5 py-2.5 text-xs rounded-lg"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || cepLoading}
            className="btn-primary w-full py-4 text-base rounded-xl disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Continuar para pagamento'}
          </button>
        </form>

        {/* ── Resumo do pedido ── */}
        <div>
          <div className="bg-white rounded-xl border border-[#e4e3e0] p-6 sticky top-24">
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
            <div className="border-t border-[#e4e3e0] mt-4 pt-4 flex justify-between items-center">
              <span className="font-700 text-gray-900">Total</span>
              <span className="font-800 text-xl" style={{ color: '#E63946' }}>{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center leading-relaxed">
              Você será redirecionado ao Mercado Pago para escolher a forma de pagamento.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}