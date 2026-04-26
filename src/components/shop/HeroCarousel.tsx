'use client';

import { useEffect, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, ArrowRight, Tag, Zap, Award, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Cada slide tem seu próprio tema de cor — como Amazon/ML, não tudo preto
const SLIDES = [
  {
    id: 1,
    badge: { icon: Tag, text: 'OFERTA DO DIA', color: '#fff', bg: '#E63946' },
    eyebrow: 'Lançamento 2025',
    title: 'Manômetros',
    highlight: 'Digitais',
    desc: 'Precisão industrial certificada com display LCD de alta resolução. Frete grátis.',
    cta: { label: 'Ver Ofertas', href: '/products?category=manometros' },
    image: '/manometro.png',
    discount: '15% OFF',
    stat: { value: '±0,1%', label: 'Precisão' },
    // Gradiente azul escuro → mais claro — elegante e técnico
    bg: 'linear-gradient(135deg, #0f2744 0%, #1a4a8a 50%, #1d5fa8 100%)',
    accentColor: '#60a5fa',
    textColor: '#fff',
    pill: '#3b82f6',
  },
  {
    id: 2,
    badge: { icon: Zap, text: 'MAIS VENDIDO', color: '#fff', bg: '#f59e0b' },
    eyebrow: 'Mais Vendido',
    title: 'Multímetros',
    highlight: 'Profissional',
    desc: 'CAT IV 600V. Indicado para instalações industriais e quadros elétricos.',
    cta: { label: 'Aproveitar', href: '/products?category=analisadores' },
    image: '/multimetro.png',
    discount: '20% OFF',
    stat: { value: 'CAT IV', label: 'Certificação' },
    // Verde escuro petróleo — premium, profissional
    bg: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)',
    accentColor: '#4ade80',
    textColor: '#fff',
    pill: '#22c55e',
  },
  {
    id: 3,
    badge: { icon: Award, text: 'ALTA PRECISÃO', color: '#fff', bg: '#7c3aed' },
    eyebrow: 'Alta Precisão',
    title: 'Termômetros',
    highlight: 'Industriais',
    desc: 'Certificados INMETRO. Range de −200°C a +1700°C. Garantia de 12 meses.',
    cta: { label: 'Explorar', href: '/products?category=termometros' },
    image: '/termometro.png',
    discount: '12% OFF',
    stat: { value: '−200°C', label: 'Range mín.' },
    // Laranja escuro queimado — energia, urgência
    bg: 'linear-gradient(135deg, #431407 0%, #9a3412 50%, #c2410c 100%)',
    accentColor: '#fb923c',
    textColor: '#fff',
    pill: '#f97316',
  },
  {
    id: 4,
    badge: { icon: Clock, text: 'NOVIDADE', color: '#fff', bg: '#0891b2' },
    eyebrow: 'Monitoramento',
    title: 'Termohigrômetros',
    highlight: 'Conectados',
    desc: 'Medição simultânea de temperatura e umidade. Memória interna e alarmes.',
    cta: { label: 'Conhecer', href: '/products?category=analisadores' },
    image: '/termohigrometro.png',
    discount: '10% OFF',
    stat: { value: '±2%UR', label: 'Precisão UR' },
    // Teal escuro — tecnologia, modernidade
    bg: 'linear-gradient(135deg, #042f2e 0%, #0f5c5a 50%, #0e7490 100%)',
    accentColor: '#22d3ee',
    textColor: '#fff',
    pill: '#06b6d4',
  },
  {
    id: 5,
    badge: { icon: Tag, text: 'PROMOÇÃO', color: '#fff', bg: '#E63946' },
    eyebrow: 'Metrologia',
    title: 'Paquímetros',
    highlight: 'Digitais IP67',
    desc: 'Resolução 0,01mm. À prova d\'água e poeira. Ideal para ambientes severos.',
    cta: { label: 'Ver Oferta', href: '/products?category=calibradores' },
    image: '/paquimetro.png',
    discount: '18% OFF',
    stat: { value: '0,01mm', label: 'Resolução' },
    // Roxo escuro elegante
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #4338ca 100%)',
    accentColor: '#a78bfa',
    textColor: '#fff',
    pill: '#818cf8',
  },
];

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5500, stopOnInteraction: false })]
  );
  const [selected, setSelected] = useState(0);
  const [prevSelected, setPrevSelected] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => {
      setPrevSelected(emblaApi.selectedScrollSnap());
      setSelected(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  const slide = SLIDES[selected];

  return (
    <>
      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(32px) scale(0.92); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-text-anim  { animation: slideInLeft  0.65s cubic-bezier(0.16,1,0.3,1) forwards; }
        .hero-img-anim   { animation: slideInRight 0.65s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .hero-badge-anim { animation: fadeUp       0.4s ease 0.05s both; }
      `}</style>

      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>

        <div className="overflow-hidden" ref={emblaRef}>
          <div style={{ display: 'flex' }}>
            {SLIDES.map((s, idx) => (
              <div key={s.id} style={{ flex: 'none', width: '100%', minWidth: 0 }}>
                <div style={{
                  background: s.bg,
                  minHeight: 'clamp(380px, 46vw, 520px)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {/* Padrão de fundo sutil */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `radial-gradient(circle at 15% 85%, rgba(255,255,255,0.04) 0%, transparent 40%),
                                      radial-gradient(circle at 85% 15%, rgba(255,255,255,0.06) 0%, transparent 40%)`,
                  }} />
                  {/* Linhas diagonais decorativas — estilo Amazon */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `repeating-linear-gradient(
                      -45deg,
                      transparent,
                      transparent 40px,
                      rgba(255,255,255,0.015) 40px,
                      rgba(255,255,255,0.015) 41px
                    )`,
                  }} />

                  <div className="container-custom" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 32,
                      padding: '40px 0',
                    }}>

                      {/* ── Coluna de Texto ── */}
                      <div
                        className={selected === idx ? 'hero-text-anim' : ''}
                        style={{ maxWidth: 520, opacity: selected === idx ? undefined : 0 }}
                      >
                        {/* Badge promoção */}
                        <div className={selected === idx ? 'hero-badge-anim' : ''}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14 }}
                        >
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: s.badge.bg,
                            color: s.badge.color,
                            fontSize: 11, fontWeight: 800,
                            padding: '4px 10px', borderRadius: 4,
                            letterSpacing: '0.1em',
                            fontFamily: 'var(--font-mono)',
                            boxShadow: `0 2px 12px rgba(0,0,0,0.3)`,
                          }}>
                            <s.badge.icon style={{ width: 11, height: 11 }} />
                            {s.badge.text}
                          </span>
                          <span style={{
                            fontSize: 11, color: 'rgba(255,255,255,0.55)',
                            fontFamily: 'var(--font-mono)',
                          }}>
                            {s.eyebrow}
                          </span>
                        </div>

                        {/* Título grande */}
                        <h1 style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 900,
                          lineHeight: 0.95,
                          letterSpacing: '-0.03em',
                          margin: '0 0 6px',
                          color: '#fff',
                          fontSize: 'clamp(2.8rem, 6vw, 5rem)',
                        }}>
                          {s.title}
                        </h1>
                        <h2 style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 900,
                          lineHeight: 0.95,
                          letterSpacing: '-0.03em',
                          margin: '0 0 20px',
                          color: s.accentColor,
                          fontSize: 'clamp(2.8rem, 6vw, 5rem)',
                        }}>
                          {s.highlight}
                        </h2>

                        <p style={{
                          fontSize: 'clamp(13px, 1.4vw, 15px)',
                          color: 'rgba(255,255,255,0.65)',
                          lineHeight: 1.65,
                          marginBottom: 28,
                          maxWidth: 420,
                        }}>
                          {s.desc}
                        </p>

                        {/* Linha de CTAs */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <Link
                            href={s.cta.href}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 8,
                              padding: '13px 26px',
                              background: '#fff',
                              color: '#111',
                              fontFamily: 'var(--font-display)',
                              fontWeight: 800,
                              fontSize: 14,
                              borderRadius: 6,
                              textDecoration: 'none',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                              transition: 'all 0.2s ease',
                              letterSpacing: '0.01em',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
                              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.35)';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
                            }}
                          >
                            {s.cta.label}
                            <ArrowRight style={{ width: 15, height: 15 }} />
                          </Link>

                          {/* Badge de desconto */}
                          <div style={{
                            padding: '8px 16px',
                            background: 'rgba(255,255,255,0.12)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 6,
                            backdropFilter: 'blur(8px)',
                          }}>
                            <span style={{
                              fontFamily: 'var(--font-display)',
                              fontWeight: 900,
                              fontSize: 20,
                              color: s.accentColor,
                              lineHeight: 1,
                              display: 'block',
                            }}>
                              {s.discount}
                            </span>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>
                              na linha completa
                            </span>
                          </div>

                          {/* Stat técnico */}
                          <div style={{
                            padding: '8px 16px',
                            background: 'rgba(255,255,255,0.08)',
                            border: `1px solid ${s.accentColor}40`,
                            borderRadius: 6,
                          }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              fontSize: 18,
                              color: s.accentColor,
                              lineHeight: 1,
                              display: 'block',
                            }}>
                              {s.stat.value}
                            </span>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
                              {s.stat.label}
                            </span>
                          </div>
                        </div>

                        {/* Trust badges */}
                        <div style={{
                          display: 'flex', gap: 16, marginTop: 22, flexWrap: 'wrap',
                        }}>
                          {['🚚 Frete Grátis +R$500', '✅ INMETRO', '🔒 Pagamento Seguro'].map(t => (
                            <span key={t} style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* ── Imagem do Produto ── */}
                      <div
                        className={`hidden sm:block ${selected === idx ? 'hero-img-anim' : ''}`}
                        style={{
                          position: 'relative',
                          flexShrink: 0,
                          width: 'clamp(260px, 30vw, 440px)',
                          height: 'clamp(240px, 28vw, 400px)',
                          opacity: selected === idx ? 1 : 0,
                        }}
                      >
                        {/* Halo luminoso atrás do produto */}
                        <div style={{
                          position: 'absolute',
                          inset: '10%',
                          background: `radial-gradient(ellipse, ${s.accentColor}35 0%, transparent 70%)`,
                          filter: 'blur(28px)',
                        }} />
                        {/* Anel decorativo — como Amazon */}
                        <div style={{
                          position: 'absolute',
                          inset: '-5%',
                          borderRadius: '50%',
                          border: `1px solid ${s.accentColor}20`,
                          animation: 'none',
                        }} />
                        <Image
                          src={s.image}
                          alt={s.title}
                          fill
                          className="object-contain object-center"
                          style={{
                            filter: `drop-shadow(0 24px 64px rgba(0,0,0,0.5)) drop-shadow(0 0 20px ${s.accentColor}20)`,
                            padding: '5%',
                          }}
                          sizes="(max-width: 1280px) 30vw, 440px"
                          priority={s.id === 1}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* ── Seta esquerda ── */}
        <button
          onClick={scrollPrev}
          aria-label="Slide anterior"
          style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            zIndex: 20, width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.6)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.5)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.35)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <ChevronLeft style={{ width: 20, height: 20 }} />
        </button>

        {/* ── Seta direita ── */}
        <button
          onClick={scrollNext}
          aria-label="Próximo slide"
          style={{
            position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
            zIndex: 20, width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.6)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.5)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.35)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <ChevronRight style={{ width: 20, height: 20 }} />
        </button>

        {/* ── Dots ── */}
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6, zIndex: 20, alignItems: 'center',
        }}>
          {SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                height: 4, borderRadius: 2, border: 'none', cursor: 'pointer', padding: 0,
                background: selected === i ? s.accentColor : 'rgba(255,255,255,0.3)',
                width: selected === i ? 28 : 6,
                transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: selected === i ? `0 0 8px ${s.accentColor}80` : 'none',
              }}
            />
          ))}
        </div>


      </div>
    </>
  );
}