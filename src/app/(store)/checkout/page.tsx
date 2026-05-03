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
  neighborhood: string; // enviado como district para a API
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

const RED = '#E63946';
const RED_DARK = '#c62d39';
const RED_LIGHT = '#fff5f5';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls = `
  w-full px-4 py-2.5 bg-white border border-[#e4e3e0] rounded-lg
  text-sm text-gray-900 placeholder-gray-400
  focus:outline-none focus:border-[#E63946] transition-all duration-200
`;
const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5";

function formatAddress(addr: SavedAddress) {
  return `${addr.street}, ${addr.number}${addr.complement ? ` — ${addr.complement}` : ''}`;
}
function formatCityState(addr: SavedAddress) {
  return `${addr.neighborhood} · ${addr.city}/${addr.state} · CEP ${addr.zip}`;
}

// ─── Address Form Fields ──────────────────────────────────────────────────────

function AddressFormFields({
  form, setForm, cepLoading, handleCepChange, label, setLabel, showLabel,
}: {
  form: AddressFormState;
  setForm: React.Dispatch<React.SetStateAction<AddressFormState>>;
  cepLoading: boolean;
  handleCepChange: (v: string) => void;
  label?: string;
  setLabel?: (v: string) => void;
  showLabel?: boolean;
}) {
  const set = (field: keyof AddressFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {showLabel && setLabel && (
        <div className="sm:col-span-2">
          <label className={labelCls}>
            Identificação <span className="font-normal text-gray-400">(ex: Casa, Trabalho)</span>
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
          CEP {cepLoading && <span className="font-normal" style={{ color: RED }}>buscando...</span>}
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

// ─── Step Badge ───────────────────────────────────────────────────────────────

function StepBadge({ n, done }: { n: number; done?: boolean }) {
  return (
    <span
      className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 transition-all"
      style={{ backgroundColor: done ? '#22c55e' : RED }}
    >
      {done ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : n}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Step = 'buyer' | 'address' | 'review';
type AddressMode = 'select' | 'new' | 'editing';

export default function CheckoutPage() {
  const { data: session }           = useSession();
  const { items, total, clearCart } = useCart();
  const router                      = useRouter();

  // Steps
  const [step, setStep] = useState<Step>('buyer');

  // Buyer
  const [buyer, setBuyer] = useState({
    name:  session?.user?.name  ?? '',
    email: session?.user?.email ?? '',
    phone: '',
  });
  const [buyerDone, setBuyerDone] = useState(false);

  // Addresses
  const [addresses, setAddresses]     = useState<SavedAddress[]>([]);
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [addressMode, setAddressMode] = useState<AddressMode>('select');
  const [editingId, setEditingId]     = useState<string | null>(null);

  const [addrForm, setAddrForm]       = useState<AddressFormState>({ ...EMPTY_ADDRESS });
  const [addrLabel, setAddrLabel]     = useState('Casa');
  const [makeDefault, setMakeDefault] = useState(false);

  const [loading, setLoading]         = useState(false);
  const [cepLoading, setCepLoading]   = useState(false);

  // Sync session name/email + busca telefone do perfil
  useEffect(() => {
    setBuyer(b => ({
      name:  b.name  || session?.user?.name  || '',
      email: b.email || session?.user?.email || '',
      phone: b.phone,
    }));
    if (!session?.user?.id) return;
    fetch('/api/user/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.phone) setBuyer(b => ({ ...b, phone: b.phone || data.phone }));
      })
      .catch(() => {});
  }, [session]);

  // ── Fetch addresses ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    fetch('/api/addresses')
      .then(r => r.json())
      .then((data: SavedAddress[]) => {
        const list = data ?? [];
        setAddresses(list);
        const def = list.find(a => a.is_default) ?? list[0];
        if (def) setSelectedId(def.id);
        setAddressMode(list.length === 0 ? 'new' : 'select');
        setAddressesLoaded(true);
      })
      .catch(() => {
        setAddressMode('new');
        setAddressesLoaded(true);
      });
  }, [session]);

  // ── CEP lookup ─────────────────────────────────────────────────────────────
  const handleCepChange = async (value: string) => {
    const masked = value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
    setAddrForm(f => ({ ...f, zip: masked }));
    const clean = value.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) { toast.error('CEP não encontrado'); return; }
      setAddrForm(f => ({
        ...f, zip: masked,
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

  // ── Buyer step ─────────────────────────────────────────────────────────────
  const confirmBuyer = () => {
    if (!buyer.name || !buyer.email || !buyer.phone) {
      toast.error('Preencha todos os dados do comprador'); return;
    }
    setBuyerDone(true);
    setStep('address');
  };

  // ── Edit address ───────────────────────────────────────────────────────────
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

  const cancelForm = () => {
    setAddrForm({ ...EMPTY_ADDRESS });
    setAddrLabel('Casa');
    setMakeDefault(false);
    setEditingId(null);
    setAddressMode(addresses.length > 0 ? 'select' : 'new');
  };

  // ── Save new address ───────────────────────────────────────────────────────
  const saveNew = async () => {
    if (!addrForm.street || !addrForm.number || !addrForm.city || !addrForm.zip) {
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
        makeDefault
          ? [...prev.map(a => ({ ...a, is_default: false })), saved]
          : [...prev, saved]
      );
      setSelectedId(saved.id);
      setAddressMode('select');
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

  // ── Delete address ─────────────────────────────────────────────────────────
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

  // ── Confirm address selection ──────────────────────────────────────────────
  const confirmAddress = () => {
    if (addressMode === 'select' && !selectedId) {
      toast.error('Selecione um endereço de entrega'); return;
    }
    setStep('review');
  };

  // ── Final submit ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!items.length) { toast.error('Seu carrinho está vazio'); return; }
    if (!session)      { toast.error('Faça login para continuar'); return; }

    let shipping: AddressFormState | null = null;

    if (addressMode === 'select') {
      const sel = addresses.find(a => a.id === selectedId);
      if (!sel) { toast.error('Selecione um endereço de entrega'); return; }
      shipping = {
        zip: sel.zip, street: sel.street, number: sel.number,
        complement: sel.complement ?? '', neighborhood: sel.neighborhood,
        city: sel.city, state: sel.state,
      };
    } else {
      if (!addrForm.street || !addrForm.number || !addrForm.city) {
        toast.error('Preencha o endereço de entrega'); return;
      }
      shipping = addrForm;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shipping_address: {
            ...buyer,
            street:      shipping.street,
            number:      shipping.number,
            complement:  shipping.complement,
            district:    shipping.neighborhood, // mapeia neighborhood → district
            city:        shipping.city,
            state:       shipping.state,
            postal_code: shipping.zip,          // mapeia zip → postal_code
            zip:         shipping.zip,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao processar pedido');
      const url = json.data.init_point;
      if (!url) throw new Error('Link de pagamento não gerado');
      clearCart();
      window.location.href = url;
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Selected address helper ────────────────────────────────────────────────
  const selectedAddr = addresses.find(a => a.id === selectedId);

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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="container-custom py-10">
      <h1 className="font-display font-extrabold text-2xl text-gray-900 mb-8">Finalizar Pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* ══ STEP 1: Dados do comprador ══ */}
          <div className="bg-white rounded-xl border border-[#e4e3e0] overflow-hidden">

            {/* Header — always visible */}
            <div
              className="flex items-center justify-between px-6 py-4 cursor-pointer select-none"
              onClick={() => setStep('buyer')}
            >
              <div className="flex items-center gap-2.5">
                <StepBadge n={1} done={buyerDone} />
                <span className="font-bold text-gray-900 text-sm">Dados do comprador</span>
              </div>

              {/* Collapsed summary */}
              {step !== 'buyer' && buyerDone && (
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-800">{buyer.name}</p>
                  <p className="text-xs text-gray-500">{buyer.email} · {buyer.phone}</p>
                </div>
              )}

              {step !== 'buyer' && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setStep('buyer'); setBuyerDone(false); }}
                  className="text-xs font-semibold ml-4 shrink-0 transition-colors"
                  style={{ color: RED }}
                >
                  Alterar
                </button>
              )}
            </div>

            {/* Expanded form */}
            {step === 'buyer' && (
              <div className="px-6 pb-6 border-t border-[#f0efed]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Nome completo</label>
                    <input
                      required value={buyer.name}
                      onChange={e => setBuyer(b => ({ ...b, name: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>E-mail</label>
                    <input
                      required type="email" value={buyer.email}
                      onChange={e => setBuyer(b => ({ ...b, email: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Telefone</label>
                    <input
                      required value={buyer.phone} placeholder="(00) 00000-0000"
                      onChange={e => setBuyer(b => ({ ...b, phone: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={confirmBuyer}
                  className="mt-5 btn-primary px-6 py-2.5 text-sm rounded-lg"
                >
                  Confirmar dados →
                </button>
              </div>
            )}
          </div>

          {/* ══ STEP 2: Endereço de entrega ══ */}
          <div
            className="bg-white rounded-xl border border-[#e4e3e0] overflow-hidden transition-opacity"
            style={{ opacity: !buyerDone ? 0.5 : 1, pointerEvents: !buyerDone ? 'none' : 'auto' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2.5">
                <StepBadge n={2} done={step === 'review'} />
                <span className="font-bold text-gray-900 text-sm">Endereço de entrega</span>
              </div>

              {/* Collapsed summary */}
              {step === 'review' && selectedAddr && (
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-800">{formatAddress(selectedAddr)}</p>
                  <p className="text-xs text-gray-500">{formatCityState(selectedAddr)}</p>
                </div>
              )}

              {step === 'review' && (
                <button
                  type="button"
                  onClick={() => setStep('address')}
                  className="text-xs font-semibold ml-4 shrink-0 transition-colors"
                  style={{ color: RED }}
                >
                  Alterar
                </button>
              )}
            </div>

            {/* Expanded — address step */}
            {(step === 'address' || step === 'buyer') && buyerDone && (
              <div className="border-t border-[#f0efed]">

                {/* SELECT mode — list of saved addresses */}
                {addressMode === 'select' && (
                  <div className="px-6 py-5">
                    {!addressesLoaded ? (
                      <div className="py-8 text-center text-sm text-gray-400">Carregando endereços...</div>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500 mb-4">
                          Selecione um endereço cadastrado ou adicione um novo.
                        </p>

                        <div className="space-y-3">
                          {addresses.map(addr => {
                            const isSelected = selectedId === addr.id;
                            return (
                              <label
                                key={addr.id}
                                onClick={() => setSelectedId(addr.id)}
                                className="flex gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-150"
                                style={{
                                  borderColor:     isSelected ? RED : '#e4e3e0',
                                  backgroundColor: isSelected ? RED_LIGHT : '#fff',
                                }}
                              >
                                {/* Radio dot */}
                                <div className="mt-0.5 shrink-0">
                                  <div
                                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all"
                                    style={{
                                      borderColor:     isSelected ? RED : '#d1d5db',
                                      backgroundColor: isSelected ? RED : 'transparent',
                                    }}
                                  >
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                </div>

                                {/* Address info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-gray-900">
                                      {addr.label || 'Endereço'}
                                    </span>
                                    {addr.is_default && (
                                      <span
                                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: RED_LIGHT, color: RED }}
                                      >
                                        Padrão
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700 mt-0.5">{formatAddress(addr)}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{formatCityState(addr)}</p>

                                  <div className="flex gap-4 mt-2.5">
                                    <button
                                      type="button"
                                      onClick={e => { e.stopPropagation(); startEdit(addr); }}
                                      className="text-xs font-semibold transition-colors"
                                      style={{ color: RED }}
                                      onMouseEnter={e => (e.currentTarget.style.color = RED_DARK)}
                                      onMouseLeave={e => (e.currentTarget.style.color = RED)}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={e => { e.stopPropagation(); deleteAddress(addr.id); }}
                                      className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      Remover
                                    </button>
                                  </div>
                                </div>
                              </label>
                            );
                          })}

                          {/* Add new button */}
                          <button
                            type="button"
                            onClick={() => { setAddrForm({ ...EMPTY_ADDRESS }); setAddrLabel('Casa'); setAddressMode('new'); }}
                            className="w-full flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3.5 transition-all duration-150 group"
                            style={{ borderColor: '#d1d5db', color: '#9ca3a8' }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.borderColor = RED;
                              (e.currentTarget as HTMLElement).style.color = RED;
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.borderColor = '#d1d5db';
                              (e.currentTarget as HTMLElement).style.color = '#9ca3a8';
                            }}
                          >
                            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span className="text-sm font-semibold">Adicionar novo endereço</span>
                          </button>
                        </div>

                        {addresses.length > 0 && (
                          <button
                            type="button"
                            onClick={confirmAddress}
                            className="mt-5 btn-primary px-6 py-2.5 text-sm rounded-lg"
                          >
                            Entregar neste endereço →
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* NEW / EDITING mode */}
                {(addressMode === 'new' || addressMode === 'editing') && (
                  <div className="px-6 py-5">
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={cancelForm}
                        className="flex items-center gap-1 text-xs font-semibold mb-5 transition-colors"
                        style={{ color: RED }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Voltar para endereços salvos
                      </button>
                    )}

                    <AddressFormFields
                      form={addrForm} setForm={setAddrForm}
                      cepLoading={cepLoading} handleCepChange={handleCepChange}
                      showLabel label={addrLabel} setLabel={setAddrLabel}
                    />

                    {/* Default toggle */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none mt-4">
                      <div
                        onClick={() => setMakeDefault(v => !v)}
                        className="w-10 h-5 rounded-full flex items-center transition-colors duration-200 cursor-pointer"
                        style={{ backgroundColor: makeDefault ? RED : '#e4e3e0' }}
                      >
                        <div
                          className="w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 mx-0.5"
                          style={{ transform: makeDefault ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600">Usar como endereço padrão</span>
                    </label>

                    <div className="flex items-center gap-3 mt-5">
                      <button
                        type="button"
                        onClick={addressMode === 'new' ? saveNew : saveEdit}
                        className="btn-primary px-5 py-2.5 text-sm rounded-lg"
                      >
                        {addressMode === 'new' ? 'Salvar e usar este endereço' : 'Salvar alterações'}
                      </button>
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={cancelForm}
                          className="btn-secondary px-5 py-2.5 text-sm rounded-lg"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ══ STEP 3: Revisão ══ */}
          {step === 'review' && (
            <div className="bg-white rounded-xl border border-[#e4e3e0] overflow-hidden">
              <div className="px-6 py-4 flex items-center gap-2.5 border-b border-[#f0efed]">
                <StepBadge n={3} />
                <span className="font-bold text-gray-900 text-sm">Revisão do pedido</span>
              </div>
              <div className="px-6 py-5 space-y-3">
                {items.map(item => (
                  <div key={item.product.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 line-clamp-1 flex-1 mr-2">
                      {item.product.name}
                      <span className="text-gray-400 ml-1">×{item.quantity}</span>
                    </span>
                    <span className="font-semibold text-gray-900 shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t border-[#f0efed] flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-extrabold text-lg" style={{ color: RED }}>
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className="px-6 pb-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary w-full py-4 text-base rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                      Processando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Ir para pagamento
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-400 mt-3 text-center leading-relaxed">
                  Você será redirecionado ao Mercado Pago para escolher a forma de pagamento.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Order summary ── */}
        <div>
          <div className="bg-white rounded-xl border border-[#e4e3e0] p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4 text-sm">Resumo do pedido</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3">
                  {/* Product image if available */}
                  <div className="w-12 h-12 rounded-lg border border-[#f0efed] shrink-0 overflow-hidden bg-gray-50 flex items-center justify-center">
                    {item.product.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 line-clamp-2 leading-tight">{item.product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Qtd: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 shrink-0 mt-0.5">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e4e3e0] mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Frete</span>
                <span className="text-green-600 font-semibold">A calcular</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#f0efed]">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-extrabold text-xl" style={{ color: RED }}>
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Delivery address preview in summary */}
            {selectedAddr && step === 'review' && (
              <div
                className="mt-4 rounded-lg p-3 text-xs"
                style={{ backgroundColor: RED_LIGHT }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-3 h-3 shrink-0" style={{ color: RED }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="font-bold" style={{ color: RED }}>Entrega em:</span>
                </div>
                <p className="text-gray-700">{formatAddress(selectedAddr)}</p>
                <p className="text-gray-500">{formatCityState(selectedAddr)}</p>
              </div>
            )}

            {/* Security badges */}
            <div className="mt-4 pt-4 border-t border-[#f0efed] flex items-center justify-center gap-3 text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 01.427 12c.931 4.218 3.944 7.67 8.126 9.097C12.67 19.67 15.684 16.218 16.615 12 15.684 7.782 12.67 4.33 8.573 2.903z" />
              </svg>
              <span className="text-[11px]">Compra 100% segura</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}