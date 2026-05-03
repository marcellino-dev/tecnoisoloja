'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const SLIDES = [
  {
    id: 0,
    eyebrow: 'Manômetros Digitais',
    title: 'Precisão\ncertificada.',
    sub: 'Display LCD de alta resolução. ±0,1% de precisão industrial. Frete grátis acima de R$500.',
    cta: { label: 'Explorar', href: '/products?category=manometros' },
    buy: { label: 'Comprar', href: '/products?category=manometros' },
    image: '/manometro.png',
    accent: '#1d6fa8',
    ctaBg: '#1d1d1f',
    ctaColor: '#fff',
    linkColor: '#0066cc',
    imgFilter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.14))',
    imgAnim: 'swoopIn',
    imgW: 'clamp(200px,30vw,380px)',
    imgH: 'clamp(180px,26vw,340px)',
  },
  {
    id: 1,
    eyebrow: 'Multímetros',
    title: 'CAT IV.\nProfissional.',
    sub: 'Certificação CAT IV 600V. Indicado para instalações industriais e quadros elétricos de alta tensão.',
    cta: { label: 'Explorar', href: '/products?category=analisadores' },
    buy: { label: 'Comprar', href: '/products?category=analisadores' },
    image: '/multimetro.png',
    accent: '#1d7a3a',
    ctaBg: '#1d7a3a',
    ctaColor: '#fff',
    linkColor: '#1d7a3a',
    imgFilter: 'drop-shadow(0 20px 48px rgba(0,120,50,0.15))',
    imgAnim: 'popUp',
    imgW: 'clamp(180px,26vw,320px)',
    imgH: 'clamp(200px,28vw,360px)',
  },
  {
    id: 2,
    eyebrow: 'Termômetros Industriais',
    title: '−200°C\na +1700°C.',
    sub: 'Certificados INMETRO. Range térmico incomparável. Garantia de 12 meses.',
    cta: { label: 'Explorar', href: '/products?category=termometros' },
    buy: { label: 'Comprar', href: '/products?category=termometros' },
    image: '/termometro.png',
    accent: '#c93912',
    ctaBg: '#c93912',
    ctaColor: '#fff',
    linkColor: '#c93912',
    imgFilter: 'drop-shadow(0 24px 44px rgba(200,60,0,0.18))',
    imgAnim: 'dropIn',
    imgW: 'clamp(120px,16vw,200px)',
    imgH: 'clamp(220px,32vw,400px)',
  },
  {
    id: 3,
    eyebrow: 'Termohigrômetros',
    title: 'Temperatura\ne umidade.',
    sub: 'Medição simultânea. Memória interna, alarmes e conectividade. Precisão ±2%UR.',
    cta: { label: 'Explorar', href: '/products?category=analisadores' },
    buy: { label: 'Comprar', href: '/products?category=analisadores' },
    image: '/termohigrometro.png',
    accent: '#0a7abf',
    ctaBg: '#0a7abf',
    ctaColor: '#fff',
    linkColor: '#0a7abf',
    imgFilter: 'drop-shadow(0 20px 48px rgba(0,120,180,0.15))',
    imgAnim: 'slideFromRight',
    imgW: 'clamp(200px,30vw,380px)',
    imgH: 'clamp(180px,26vw,320px)',
  },
  {
    id: 4,
    eyebrow: 'Paquímetros IP67',
    title: 'Resolução\n0,01 mm.',
    sub: "À prova d'água e poeira. Ideal para ambientes industriais severos. 18% OFF na linha completa.",
    cta: { label: 'Explorar', href: '/products?category=calibradores' },
    buy: { label: 'Comprar', href: '/products?category=calibradores' },
    image: '/paquimetro.png',
    accent: '#6e23c8',
    ctaBg: '#6e23c8',
    ctaColor: '#fff',
    linkColor: '#6e23c8',
    imgFilter: 'drop-shadow(0 16px 40px rgba(90,0,180,0.15))',
    imgAnim: 'scaleIn',
    imgW: 'clamp(220px,34vw,420px)',
    imgH: 'clamp(140px,20vw,240px)',
  },
];

const INTERVAL = 5800;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  const goTo = useCallback(
    (idx: number) => {
      const next = ((idx % SLIDES.length) + SLIDES.length) % SLIDES.length;
      if (next === current || animating) return;
      setAnimating(true);
      setCurrent(next);
      setAnimKey((k) => k + 1);
      setTimeout(() => setAnimating(false), 800);
    },
    [current, animating]
  );

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!paused) {
      timerRef.current = setInterval(() => goTo(current + 1), INTERVAL);
    }
  }, [paused, current, goTo]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const slide = SLIDES[current];

  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: '#fff',
        fontFamily: "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif",
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 48) goTo(current + (dx < 0 ? 1 : -1));
      }}
    >
      {/* SLIDE */}
      <div
        style={{
          minHeight: 'clamp(360px,46vw,480px)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 72px 0 64px',
          gap: 32,
          position: 'relative',
        }}
      >
        {/* TEXT — LEFT */}
        <div
          style={{
            flex: '0 0 auto',
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 10,
            zIndex: 2,
          }}
        >
          <p
            key={`ey-${animKey}`}
            className="hero-ey-enter"
            style={{ fontSize: 13, fontWeight: 600, color: slide.accent, letterSpacing: '0.02em', margin: 0 }}
          >
            {slide.eyebrow}
          </p>

          <h1
            key={`ti-${animKey}`}
            className="hero-ti-enter"
            style={{
              fontSize: 'clamp(2.2rem,5vw,3.6rem)',
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: '-0.028em',
              color: '#1d1d1f',
              whiteSpace: 'pre-line',
              margin: 0,
            }}
          >
            {slide.title}
          </h1>

          <p
            key={`su-${animKey}`}
            className="hero-su-enter"
            style={{
              fontSize: 'clamp(13px,1.5vw,15px)',
              fontWeight: 400,
              lineHeight: 1.55,
              color: '#6e6e73',
              maxWidth: 320,
              margin: 0,
            }}
          >
            {slide.sub}
          </p>

          <div
            key={`ct-${animKey}`}
            className="hero-ct-enter"
            style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginTop: 4 }}
          >
            <Link
              href={slide.cta.href}
              className="hero-cta-pill"
              style={{ background: slide.ctaBg, color: slide.ctaColor }}
            >
              {slide.cta.label}
            </Link>
            <Link
              href={slide.buy.href}
              className="hero-cta-link"
              style={{ color: slide.linkColor }}
            >
              {slide.buy.label} <span className="hero-arrow">→</span>
            </Link>
          </div>
        </div>

        {/* IMAGE — RIGHT */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'clamp(280px,36vw,420px)',
          }}
        >
          <div
            key={`img-${animKey}`}
            className="hero-img-enter"
            style={{
              position: 'relative',
              width: slide.imgW,
              height: slide.imgH,
              '--hero-ia': slide.imgAnim,
            } as React.CSSProperties}
            onAnimationEnd={(e) => {
              if (e.animationName === slide.imgAnim) {
                const el = e.currentTarget as HTMLDivElement;
                el.classList.remove('hero-img-enter');
                el.classList.add('hero-img-idle');
              }
            }}
          >
            <Image
              src={slide.image}
              alt={slide.eyebrow}
              fill
              className="object-contain"
              style={{ filter: slide.imgFilter }}
              sizes="(max-width: 768px) 60vw, 34vw"
              priority={slide.id === 0}
            />
          </div>
        </div>
      </div>

      {/* NAV PREV */}
      <button
        className="hero-nav-btn"
        onClick={() => goTo(current - 1)}
        aria-label="Slide anterior"
        style={{ left: 14 }}
      >
        <ChevronLeft style={{ width: 16, height: 16, color: '#1d1d1f' }} />
      </button>

      {/* NAV NEXT */}
      <button
        className="hero-nav-btn"
        onClick={() => goTo(current + 1)}
        aria-label="Próximo slide"
        style={{ right: 14 }}
      >
        <ChevronRight style={{ width: 16, height: 16, color: '#1d1d1f' }} />
      </button>

      {/* PAUSE */}
      <button
        className="hero-pause-btn"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? 'Continuar' : 'Pausar'}
      >
        {paused
          ? <Play style={{ width: 11, height: 11, color: '#1d1d1f' }} />
          : <Pause style={{ width: 11, height: 11, color: '#1d1d1f' }} />
        }
      </button>

      {/* DOTS */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 5,
          alignItems: 'center',
          zIndex: 30,
        }}
      >
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              borderRadius: 980,
              height: 6,
              width: i === current ? 22 : 7,
              background: i === current ? slide.accent : 'rgba(0,0,0,0.18)',
              transition: 'width 0.4s cubic-bezier(0.77,0,0.175,1), background 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
}