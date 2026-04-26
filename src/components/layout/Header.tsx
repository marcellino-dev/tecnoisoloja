'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useCartStore } from '@/lib/store/cart';
import {
  ShoppingCart, User, LogOut, LayoutDashboard, Menu, X,
  Search, MapPin, ChevronDown, Package, Loader2, Navigation
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { label: 'Termômetros',   slug: 'termometros',  icon: '🌡️' },
  { label: 'Manômetros',    slug: 'manometros',   icon: '⚙️' },
  { label: 'Analisadores',  slug: 'analisadores', icon: '📊' },
  { label: 'Calibradores',  slug: 'calibradores', icon: '📏' },
  { label: 'Dataloggers',   slug: 'dataloggers',  icon: '💾' },
  { label: 'EPIs',          slug: 'epis',         icon: '🦺' },
];

interface CepInfo {
  cep: string;
  city: string;
  state: string;
}

export function Header() {
  const { data: session } = useSession();
  const count = useCartStore(s => s.count());

  const [menuOpen, setMenuOpen]           = useState(false);
  const [userMenuOpen, setUserMenuOpen]   = useState(false);
  const [catMenuOpen, setCatMenuOpen]     = useState(false);
  const [scrolled, setScrolled]           = useState(false);
  const [search, setSearch]               = useState('');
  const [mounted, setMounted]             = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [cepInfo, setCepInfo]             = useState<CepInfo | null>(null);
  const [cepLoading, setCepLoading]       = useState(false);
  const [cepOpen, setCepOpen]             = useState(false);
  const [cepInput, setCepInput]           = useState('');
  const [cepError, setCepError]           = useState('');
  // novo: estado para geo
  const [geoLoading, setGeoLoading]       = useState(false);
  const [geoError, setGeoError]           = useState('');

  const router  = useRouter();
  const userRef = useRef<HTMLDivElement>(null);
  const catRef  = useRef<HTMLDivElement>(null);
  const cepRef  = useRef<HTMLDivElement>(null);

  const isAdmin = (session?.user as any)?.role === 'admin';

  // ── Detecta CEP por IP (fallback silencioso) ──────────────────────────────
  const detectCepByIp = useCallback(async () => {
    // Só usa IP se ainda não tiver CEP salvo na sessão
    const saved = sessionStorage.getItem('location_cep');
    const savedCity = sessionStorage.getItem('location_city');
    const savedState = sessionStorage.getItem('location_state');
    if (saved && savedCity && savedState) {
      setCepInfo({ cep: saved, city: savedCity, state: savedState });
      return;
    }
    setCepLoading(true);
    try {
      const res  = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
      const data = await res.json();
      if (data.postal && data.city && data.region_code) {
        const info = { cep: data.postal, city: data.city, state: data.region_code };
        setCepInfo(info);
        sessionStorage.setItem('location_cep',   info.cep);
        sessionStorage.setItem('location_city',  info.city);
        sessionStorage.setItem('location_state', info.state);
      }
    } catch {
      // silently fail — usuário pode informar manualmente
    } finally {
      setCepLoading(false);
    }
  }, []);

  // ── Detecta CEP por Geolocalização do navegador ───────────────────────────
  const detectCepByGeo = useCallback(async () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocalização não suportada neste navegador.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Nominatim — gratuito, sem API key
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'pt-BR' } }
          );
          const data = await res.json();
          const postcode: string | undefined = data?.address?.postcode;
          const city: string | undefined =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.municipality;
          const state: string | undefined = data?.address?.['ISO3166-2-lvl4']?.split('-')[1]
            ?? data?.address?.state;

          if (postcode && city) {
            const raw = postcode.replace(/\D/g, '');
            const formatted = raw.length === 8 ? `${raw.slice(0,5)}-${raw.slice(5)}` : postcode;
            const info = { cep: formatted, city, state: state ?? '' };
            setCepInfo(info);
            sessionStorage.setItem('location_cep',   info.cep);
            sessionStorage.setItem('location_city',  info.city);
            sessionStorage.setItem('location_state', info.state);
            setCepOpen(false);
          } else {
            setGeoError('CEP não encontrado para sua localização.');
          }
        } catch {
          setGeoError('Erro ao buscar localização.');
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setGeoError('Permissão de localização negada.');
        setGeoLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  // ── Busca CEP digitado manualmente (ViaCEP) ───────────────────────────────
  const fetchCepManual = async () => {
    const raw = cepInput.replace(/\D/g, '');
    if (raw.length !== 8) { setCepError('CEP deve ter 8 dígitos'); return; }
    setCepLoading(true);
    setCepError('');
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const data = await res.json();
      if (data.erro) { setCepError('CEP não encontrado'); return; }
      const info = { cep: raw, city: data.localidade, state: data.uf };
      setCepInfo(info);
      sessionStorage.setItem('location_cep',   info.cep);
      sessionStorage.setItem('location_city',  info.city);
      sessionStorage.setItem('location_state', info.state);
      setCepOpen(false);
    } catch {
      setCepError('Erro ao buscar CEP');
    } finally {
      setCepLoading(false);
    }
  };

  useEffect(() => { setMounted(true); detectCepByIp(); }, [detectCepByIp]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (catRef.current  && !catRef.current.contains(e.target as Node))  setCatMenuOpen(false);
      if (cepRef.current  && !cepRef.current.contains(e.target as Node))  { setCepOpen(false); setGeoError(''); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/products?q=${encodeURIComponent(search.trim())}`);
  };

  const formatCep = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 8);
    return d.length > 5 ? `${d.slice(0,5)}-${d.slice(5)}` : d;
  };

  const headerBg  = scrolled ? 'rgba(10,10,10,0.97)' : '#fff';
  const textColor = scrolled ? '#fff' : '#111';
  const textMuted = scrolled ? 'rgba(255,255,255,0.65)' : '#4b5563';
  const hoverBg   = scrolled ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

  return (
    <>
      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn    { from { opacity:0 } to { opacity:1 } }
        @keyframes spin      { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-50" style={{ fontFamily: 'var(--font-display)' }}>

        {/* ── Barra principal ── */}
        <div style={{
          background: headerBg,
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.4)' : '0 1px 0 #e5e7eb',
          transition: 'all 0.3s ease',
        }}>
          <div className="container-custom">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>

              {/* Logo */}
              <Link href="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <Image
                  src="/logotecnoiso.png"
                  alt="Tecnoiso"
                  width={130}
                  height={38}
                  style={{
                    width: 'auto', height: 36, objectFit: 'contain',
                    filter: scrolled ? 'brightness(0) invert(1)' : 'none',
                    transition: 'filter 0.3s ease',
                  }}
                  priority
                />
              </Link>

              {/* ── CEP ── */}
              <div className="hidden lg:block" ref={cepRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => { setCepOpen(o => !o); setCepError(''); setGeoError(''); }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px 8px', borderRadius: 6,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = hoverBg}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                >
                  <MapPin style={{ width: 16, height: 16, color: '#E63946', marginTop: 2, flexShrink: 0 }} />
                  <div style={{ lineHeight: 1.25, textAlign: 'left' }}>
                    <p style={{ fontSize: 10, color: textMuted, margin: 0 }}>Enviar para</p>
                    {cepLoading || geoLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Loader2 style={{ width: 11, height: 11, color: '#9ca3af', animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>Detectando...</span>
                      </div>
                    ) : cepInfo ? (
                      <p style={{ fontSize: 12, fontWeight: 700, color: textColor, margin: 0, textDecoration: 'underline', textDecorationColor: 'rgba(0,0,0,0.2)' }}>
                        {cepInfo.city}{cepInfo.state ? `, ${cepInfo.state}` : ''}
                      </p>
                    ) : (
                      <p style={{ fontSize: 12, fontWeight: 700, color: textColor, margin: 0, textDecoration: 'underline', textDecorationColor: 'rgba(0,0,0,0.2)' }}>
                        Informe seu CEP
                      </p>
                    )}
                  </div>
                </button>

                {cepOpen && (
                  <div style={{
                    position: 'absolute', left: 0, top: 'calc(100% + 10px)',
                    width: 290, background: '#fff',
                    borderRadius: 10, boxShadow: '0 16px 48px rgba(0,0,0,0.22)',
                    border: '1px solid #e5e7eb', overflow: 'hidden', zIndex: 200,
                    animation: 'slideDown 0.15s ease',
                  }}>
                    <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #f3f4f6' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>Escolher endereço de entrega</p>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                        {cepInfo ? `Localização atual: ${cepInfo.city} – ${cepInfo.cep}` : 'Digite seu CEP ou use sua localização'}
                      </p>
                    </div>

                    {/* ── Botão de geolocalização ── */}
                    <div style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6' }}>
                      <button
                        onClick={detectCepByGeo}
                        disabled={geoLoading}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '9px 14px',
                          background: geoLoading ? '#f9fafb' : '#fef2f2',
                          border: '1.5px solid #fecaca',
                          borderRadius: 7, cursor: geoLoading ? 'default' : 'pointer',
                          fontSize: 12.5, fontWeight: 600, color: '#E63946',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { if (!geoLoading) (e.currentTarget as HTMLButtonElement).style.background = '#fee2e2'; }}
                        onMouseLeave={e => { if (!geoLoading) (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; }}
                      >
                        {geoLoading ? (
                          <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <Navigation style={{ width: 14, height: 14 }} />
                        )}
                        {geoLoading ? 'Detectando localização...' : 'Usar minha localização atual'}
                      </button>
                      {geoError && (
                        <p style={{ fontSize: 11, color: '#E63946', margin: '6px 0 0', textAlign: 'center' }}>{geoError}</p>
                      )}
                    </div>

                    {/* ── Separador ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
                      <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>ou digite o CEP</span>
                      <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
                    </div>

                    {/* ── Input manual ── */}
                    <div style={{ padding: '0 16px 14px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          value={cepInput}
                          onChange={e => setCepInput(formatCep(e.target.value))}
                          onKeyDown={e => e.key === 'Enter' && fetchCepManual()}
                          placeholder="00000-000"
                          maxLength={9}
                          autoFocus
                          style={{
                            flex: 1, padding: '9px 12px',
                            border: `1.5px solid ${cepError ? '#E63946' : '#e5e7eb'}`,
                            borderRadius: 7, fontSize: 13, outline: 'none',
                            color: '#111', fontFamily: 'var(--font-mono)',
                            transition: 'border-color 0.2s',
                          }}
                          onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = '#E63946'}
                          onBlur={e => { if (!cepError) (e.currentTarget as HTMLInputElement).style.borderColor = '#e5e7eb'; }}
                        />
                        <button
                          onClick={fetchCepManual}
                          disabled={cepLoading}
                          style={{
                            padding: '9px 14px', background: '#E63946', color: '#fff',
                            border: 'none', borderRadius: 7,
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5,
                            flexShrink: 0, transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#c62d39'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#E63946'}
                        >
                          {cepLoading ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> : 'OK'}
                        </button>
                      </div>
                      {cepError && <p style={{ fontSize: 11, color: '#E63946', margin: '6px 0 0' }}>{cepError}</p>}
                      <a
                        href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: 'block', marginTop: 8, fontSize: 11, color: '#E63946', textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        Não sei meu CEP
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Busca ── */}
              <form onSubmit={handleSearch} style={{ flex: 1 }}>
                <div style={{
                  display: 'flex', width: '100%',
                  borderRadius: 8, overflow: 'hidden',
                  border: `2px solid ${searchFocused ? '#E63946' : scrolled ? 'transparent' : '#d1d5db'}`,
                  transition: 'border-color 0.2s ease',
                  background: scrolled ? '#fff' : '#f3f4f6',
                }}>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Buscar instrumentos, marcas, categorias..."
                    style={{
                      flex: 1, padding: '10px 14px',
                      background: 'transparent',
                      border: 'none', outline: 'none',
                      fontSize: 13.5, color: '#111',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button type="submit"
                    style={{
                      padding: '0 18px', background: '#E63946',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.2s', flexShrink: 0,
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#c62d39'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#E63946'}
                  >
                    <Search style={{ width: 18, height: 18, color: '#fff' }} />
                  </button>
                </div>
              </form>

              {/* ── Auth + Cart ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>

                {session ? (
                  <div className="relative" ref={userRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: textColor, padding: '4px 6px', borderRadius: 6,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = hoverBg}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                    >
                      {session.user?.image ? (
                        <Image src={session.user.image} alt="" width={30} height={30}
                          style={{ borderRadius: '50%', border: '2px solid rgba(230,57,70,0.5)' }} />
                      ) : (
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: 'rgba(230,57,70,0.12)',
                          border: '2px solid rgba(230,57,70,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <User style={{ width: 14, height: 14, color: '#E63946' }} />
                        </div>
                      )}
                      <div className="hidden sm:block" style={{ textAlign: 'left', lineHeight: 1.2 }}>
                        <p style={{ fontSize: 10, color: textMuted, margin: 0 }}>
                          Olá, {session.user?.name?.split(' ')[0]}
                        </p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: textColor, margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                          Minha conta
                          <ChevronDown style={{ width: 11, height: 11, transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </p>
                      </div>
                    </button>

                    {userMenuOpen && (
                      <div style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                        width: 220, background: '#fff',
                        borderRadius: 10, boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
                        border: '1px solid #f0f0f0', overflow: 'hidden',
                        animation: 'slideDown 0.15s ease', zIndex: 200,
                      }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5', background: '#fafafa' }}>
                          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Logado como</p>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {session.user?.email}
                          </p>
                          {isAdmin && (
                            <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10, background: '#fef2f2', color: '#E63946', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>
                              ADMIN
                            </span>
                          )}
                        </div>

                        {[
                          { href: '/orders', label: 'Meus Pedidos', icon: Package, color: '#374151' },
                          ...(isAdmin ? [{ href: '/admin', label: 'Painel Admin', icon: LayoutDashboard, color: '#E63946' }] : []),
                        ].map(item => (
                          <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: item.color, textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'background 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#f9fafb'}
                            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'}
                          >
                            <item.icon style={{ width: 15, height: 15 }} />
                            {item.label}
                          </Link>
                        ))}

                        <button onClick={() => { signOut(); setUserMenuOpen(false); }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: '#E63946', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, borderTop: '1px solid #f5f5f5' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                        >
                          <LogOut style={{ width: 15, height: 15 }} /> Sair
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => signIn('google')} className="hidden sm:block"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', lineHeight: 1.2, padding: '4px 6px', borderRadius: 6, transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = hoverBg}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                  >
                    <p style={{ fontSize: 10, color: textMuted, margin: 0 }}>Bem-vindo!</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: textColor, margin: 0 }}>Entrar / Cadastrar</p>
                  </button>
                )}

                {/* Carrinho */}
                <Link href="/cart" style={{
                  position: 'relative', color: textColor, textDecoration: 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  padding: '4px 8px', borderRadius: 6, transition: 'background 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = hoverBg}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'none'}
                >
                  <div style={{ position: 'relative' }}>
                    <ShoppingCart style={{ width: 23, height: 23 }} />
                    {mounted && count > 0 && (
                      <span style={{
                        position: 'absolute', top: -6, right: -7,
                        minWidth: 18, height: 18,
                        background: '#E63946', borderRadius: 9,
                        fontSize: 10, fontWeight: 700, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid ${scrolled ? '#0a0a0a' : '#fff'}`, padding: '0 3px',
                      }}>
                        {count > 9 ? '9+' : count}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:block" style={{ fontSize: 10, color: textMuted, lineHeight: 1 }}>
                    Carrinho
                  </span>
                </Link>

                {/* Mobile toggle */}
                <button className="sm:hidden" onClick={() => setMenuOpen(!menuOpen)}
                  style={{ background: 'none', border: 'none', color: textColor, cursor: 'pointer', padding: 4 }}>
                  {menuOpen ? <X style={{ width: 22, height: 22 }} /> : <Menu style={{ width: 22, height: 22 }} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Barra de categorias ── */}
        <div style={{
          background: '#111',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div className="container-custom">
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 40, overflowX: 'auto' }}>

              <div className="relative" ref={catRef} style={{ flexShrink: 0 }}>
                <button
                  onClick={() => setCatMenuOpen(!catMenuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: catMenuOpen ? '#E63946' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    padding: '6px 12px', borderRadius: 5,
                    color: catMenuOpen ? '#fff' : 'rgba(255,255,255,0.75)',
                    fontSize: 12.5, fontWeight: 600,
                    transition: 'all 0.2s', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!catMenuOpen) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; } }}
                  onMouseLeave={e => { if (!catMenuOpen) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)'; } }}
                >
                  <span style={{ fontSize: 14, lineHeight: 1 }}>☰</span>
                  Todas Categorias
                  <ChevronDown style={{ width: 12, height: 12, transform: catMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {catMenuOpen && (
                  <div style={{
                    position: 'absolute', left: 0, top: 'calc(100% + 6px)',
                    width: 230, background: '#fff',
                    borderRadius: 10, boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                    border: '1px solid #f0f0f0', overflow: 'hidden', zIndex: 200,
                    animation: 'slideDown 0.15s ease',
                  }}>
                    {CATEGORIES.map((cat, idx) => (
                      <Link key={cat.slug} href={`/products?category=${cat.slug}`} onClick={() => setCatMenuOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 16px', color: '#374151',
                          textDecoration: 'none', fontSize: 13, fontWeight: 500,
                          borderBottom: idx < CATEGORIES.length - 1 ? '1px solid #f9fafb' : 'none',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fef2f2'; (e.currentTarget as HTMLAnchorElement).style.color = '#E63946'; (e.currentTarget as HTMLAnchorElement).style.paddingLeft = '20px'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#374151'; (e.currentTarget as HTMLAnchorElement).style.paddingLeft = '16px'; }}
                      >
                        <span style={{ fontSize: 16 }}>{cat.icon}</span>
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.1)', flexShrink: 0, marginLeft: 4, marginRight: 4 }} />

              {[
                { href: '/products?offer=true', label: '🔥 Ofertas',        accent: true },
                { href: '/products',            label: 'Todos os Produtos', accent: false },
                { href: '/about',               label: 'Sobre Nós',         accent: false },
                { href: '/contact',             label: 'Contato',           accent: false },
              ].map(link => (
                <Link key={link.href} href={link.href}
                  style={{
                    fontSize: 12.5, fontWeight: link.accent ? 700 : 500,
                    color: link.accent ? '#E63946' : 'rgba(255,255,255,0.6)',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                    padding: '6px 10px', borderRadius: 5,
                    transition: 'all 0.2s', flexShrink: 0,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = link.accent ? '#ff4d5a' : '#fff'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = link.accent ? '#E63946' : 'rgba(255,255,255,0.6)'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Menu mobile ── */}
        {menuOpen && (
          <div style={{
            background: 'rgba(10,10,10,0.98)', backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            animation: 'slideDown 0.2s ease',
          }}>
            <div className="container-custom" style={{ paddingTop: 8, paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* CEP no mobile — com botão de geo */}
              <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin style={{ width: 14, height: 14, color: '#E63946' }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                    {cepInfo ? `Entregando em ${cepInfo.city}, ${cepInfo.state}` : 'Informe seu CEP'}
                  </span>
                </div>
                <button
                  onClick={detectCepByGeo}
                  disabled={geoLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.3)',
                    borderRadius: 5, padding: '4px 8px',
                    fontSize: 11, fontWeight: 600, color: '#E63946', cursor: 'pointer',
                  }}
                >
                  {geoLoading
                    ? <Loader2 style={{ width: 11, height: 11, animation: 'spin 1s linear infinite' }} />
                    : <Navigation style={{ width: 11, height: 11 }} />
                  }
                  {geoLoading ? 'Buscando...' : 'Detectar'}
                </button>
              </div>

              {[
                { href: '/',         label: '🏠 Início' },
                { href: '/products', label: '📦 Produtos' },
                { href: `/cart`,     label: `🛒 Carrinho (${mounted ? count : 0})` },
                { href: '/orders',   label: '📋 Meus Pedidos' },
                { href: '/contact',  label: '📞 Contato' },
              ].map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '11px 12px', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 14, fontWeight: 500, borderRadius: 7, transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'; }}
                >
                  {link.label}
                </Link>
              ))}
              {!session && (
                <button onClick={() => signIn('google')}
                  style={{ marginTop: 8, padding: '13px 16px', background: '#E63946', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#c62d39'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#E63946'}
                >
                  Entrar com Google
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}