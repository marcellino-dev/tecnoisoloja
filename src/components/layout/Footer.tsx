'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook, Clock, ArrowRight, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const QUICK_LINKS = [
  { href: '/products',        label: 'Todos os Produtos' },
  { href: '/products?offer=true', label: 'Ofertas e Promoções' },
  { href: '/about',           label: 'Sobre a Tecnoiso' },
  { href: '/contact',         label: 'Fale Conosco' },
  { href: '/orders',          label: 'Meus Pedidos' },
];

const CATEGORIES = [
  { href: '/products?category=manometros',  label: 'Manômetros' },
  { href: '/products?category=termometros', label: 'Termômetros' },
  { href: '/products?category=calibradores',label: 'Paquímetros e Micrômetros' },
  { href: '/products?category=analisadores',label: 'Multímetros' },
  { href: '/products?category=dataloggers', label: 'Dataloggers' },
  { href: '/products?category=epis',        label: 'EPIs' },
];

const CONTACT_ITEMS = [
  { Icon: MapPin, text: 'R. Dona Emma, 1541 – Floresta\nJoinville – SC, 89211-493' },
  { Icon: Phone,  text: '(47) 3438-3175' },
  { Icon: Mail,   text: 'contato@tecnoiso.com' },
  { Icon: Clock,  text: 'Seg–Sex: 07:42 – 17:30' },
];

const SOCIALS = [
  { href: 'https://facebook.com', Icon: Facebook,  label: 'Facebook' },
  { href: 'https://instagram.com', Icon: Instagram, label: 'Instagram' },
  { href: 'https://linkedin.com',  Icon: Linkedin,  label: 'LinkedIn' },
];

const PAYMENTS = [
  { label: 'PIX',          accent: '#06b6d4' },
  { label: 'CRÉDITO',      accent: '#a3a3a3' },
  { label: 'DÉBITO',       accent: '#a3a3a3' },
  { label: 'BOLETO',       accent: '#a3a3a3' },
  { label: 'MERCADO PAGO', accent: '#06b6d4' },
];

export function Footer() {
  const [email, setEmail]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3500);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.06)' }}>

      {/* ── Newsletter ─────────────────────────────────────────────────── */}
      <div style={{
        background: '#141414',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '36px 0',
      }}>
        <div className="container-custom">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}>
            {/* Copy */}
            <div>
              <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: '#E63946', textTransform: 'uppercase', margin: '0 0 6px' }}>
                Newsletter
              </p>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em',
              }}>
                Ofertas exclusivas no seu e-mail
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>
                Promoções, novidades e dicas técnicas da Tecnoiso
              </p>
            </div>

            {/* Form */}
            <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 420 }}>
              {submitted ? (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.25)',
                  borderRadius: 8, padding: '12px 20px',
                  color: '#4ade80', fontSize: 13, fontWeight: 600,
                }}>
                  ✓ Cadastrado com sucesso!
                </div>
              ) : (
                <form onSubmit={handleNewsletter} style={{ display: 'flex', gap: 0 }}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    style={{
                      flex: 1, padding: '11px 16px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRight: 'none',
                      borderRadius: '7px 0 0 7px',
                      color: '#fff', fontSize: 13, outline: 'none',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(230,57,70,0.5)'}
                    onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                  <button type="submit"
                    style={{
                      padding: '11px 20px', background: '#E63946',
                      color: '#fff', border: 'none',
                      borderRadius: '0 7px 7px 0', cursor: 'pointer',
                      fontWeight: 700, fontSize: 13,
                      display: 'flex', alignItems: 'center', gap: 6,
                      transition: 'background 0.2s', whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#c62d39'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#E63946'}
                  >
                    Cadastrar <ArrowRight style={{ width: 14, height: 14 }} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Colunas de links ───────────────────────────────────────────── */}
      <div style={{ padding: '56px 0 44px' }}>
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand */}
            <div>
              <Image
                src="/logotecnoiso.png"
                alt="Tecnoiso"
                width={130}
                height={40}
                style={{ width: 'auto', height: 38, objectFit: 'contain', marginBottom: 14, filter: 'brightness(0) invert(1)' }}
              />
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12.5, lineHeight: 1.75, marginBottom: 20 }}>
                Especialistas em instrumentos de medição há mais de 20 anos. Produtos certificados com garantia e suporte técnico.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {SOCIALS.map(({ href, Icon, label }) => (
                  <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s', color: 'rgba(255,255,255,0.45)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#E63946'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E63946'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)'; }}
                  >
                    <Icon style={{ width: 14, height: 14 }} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Rápidos */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', fontSize: 13, marginBottom: 18, letterSpacing: '0.01em' }}>
                Links Rápidos
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {QUICK_LINKS.map(l => (
                  <li key={l.label}>
                    <Link href={l.href}
                      style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13, transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#E63946'; (e.currentTarget as HTMLAnchorElement).style.paddingLeft = '5px'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLAnchorElement).style.paddingLeft = '0px'; }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categorias */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', fontSize: 13, marginBottom: 18, letterSpacing: '0.01em' }}>
                Categorias
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {CATEGORIES.map(l => (
                  <li key={l.label}>
                    <Link href={l.href}
                      style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13, transition: 'all 0.2s', display: 'inline-block' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#E63946'; (e.currentTarget as HTMLAnchorElement).style.paddingLeft = '5px'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLAnchorElement).style.paddingLeft = '0px'; }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', fontSize: 13, marginBottom: 18, letterSpacing: '0.01em' }}>
                Contato
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {CONTACT_ITEMS.map(({ Icon, text }, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 6, flexShrink: 0, marginTop: 1,
                      background: 'rgba(230,57,70,0.1)',
                      border: '1px solid rgba(230,57,70,0.18)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon style={{ width: 12, height: 12, color: '#E63946' }} />
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12.5, lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      {/* ── Rodapé inferior ───────────────────────────────────────────── */}
      <div style={{ padding: '18px 0' }}>
        <div className="container-custom" style={{
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between',
          gap: 12,
        }}>

          {/* Pagamentos */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            {PAYMENTS.map(p => (
              <span key={p.label} style={{
                padding: '3px 9px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 4,
                fontSize: 10, fontWeight: 700,
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: '0.06em',
                fontFamily: 'var(--font-mono)',
              }}>
                {p.label}
              </span>
            ))}
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 4 }}>
              🔒 Compra segura
            </span>
          </div>

          {/* Copyright + voltar ao topo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
              © {new Date().getFullYear()} Tecnoiso. Todos os direitos reservados.
            </p>
            <button
              onClick={scrollToTop}
              aria-label="Voltar ao topo"
              style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s', flexShrink: 0,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E63946'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E63946'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; }}
            >
              <ChevronUp style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}