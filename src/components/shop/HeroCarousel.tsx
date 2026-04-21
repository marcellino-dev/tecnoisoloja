'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const SLIDES = [
  {
    id: 1,
    bg: '#fef9c3',
    accent: '#854d0e',
    tag: 'Lançamento',
    title: 'Manômetros',
    subtitle: 'Digital',
    desc: 'Frete grátis a partir de R$ 500',
    cta: { label: 'Ver Produtos', href: '/products?category=manometros' },
    image: '/manometro.png',
    dark: false,
  },
  {
    id: 2,
    bg: '#ea580c',
    accent: '#fff7ed',
    tag: 'Mais Vendido',
    title: 'Multímetros',
    subtitle: 'Profissional',
    desc: 'Até 15% de desconto na primeira compra',
    cta: { label: 'Aproveitar', href: '/products?category=analisadores' },
    image: '/multimetro.png',
    dark: true,
  },
  {
    id: 3,
    bg: '#1e40af',
    accent: '#eff6ff',
    tag: 'Precisão',
    title: 'Termômetros',
    subtitle: 'Industriais',
    desc: 'Equipamentos certificados com garantia de fábrica',
    cta: { label: 'Explorar', href: '/products?category=termometros' },
    image: '/termometro.png',
    dark: true,
  },
  {
    id: 4,
    bg: '#15803d',
    accent: '#f0fdf4',
    tag: 'Novidade',
    title: 'Termohigrômetros',
    subtitle: 'Alta Precisão',
    desc: 'Monitoramento de temperatura e umidade',
    cta: { label: 'Conhecer', href: '/products?category=analisadores' },
    image: '/termohigrometro.png',
    dark: true,
  },
  {
    id: 5,
    bg: '#1e293b',
    accent: '#f8fafc',
    tag: 'Promoção',
    title: 'Paquímetros',
    subtitle: 'Digitais',
    desc: 'Medição com precisão de 0,01mm',
    cta: { label: 'Ver Oferta', href: '/products?category=calibradores' },
    image: '/paquimetro.png',
    dark: true,
  },
];

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 4500, stopOnInteraction: false })]
  );
  const [selected, setSelected] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => setSelected(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  return (
    <div className="relative w-full" style={{ isolation: 'isolate' }}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {SLIDES.map((slide) => (
            <div key={slide.id} className="flex-none w-full">
              <div
                className="relative w-full flex items-center"
                style={{
                  height: 'clamp(340px, 46vw, 520px)',
                  backgroundColor: slide.bg,
                }}
              >
                <div className="container-custom relative z-10 flex items-center justify-between w-full gap-8">

                  {/* Texto */}
                  <div className="max-w-lg py-10">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs mb-4"
                      style={{
                        background: slide.dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)',
                        color: slide.dark ? 'rgba(255,255,255,0.9)' : slide.accent,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 500,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {slide.tag}
                    </span>

                    <h2
                      className="leading-[1.05] mb-4"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        color: slide.dark ? '#ffffff' : '#1c1917',
                      }}
                    >
                      {slide.title}
                      <br />
                      <span style={{ color: slide.dark ? 'rgba(255,255,255,0.75)' : slide.accent }}>
                        {slide.subtitle}
                      </span>
                    </h2>

                    <p
                      className="text-base mb-1"
                      style={{
                        fontWeight: 400,
                        color: slide.dark ? 'rgba(255,255,255,0.75)' : '#57534e',
                      }}
                    >
                      {slide.desc}
                    </p>

                    <p
                      className="text-xs mb-6"
                      style={{ color: slide.dark ? 'rgba(255,255,255,0.4)' : '#a8a29e' }}
                    >
                      *Consulte Termos e Condições. Imagens ilustrativas.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={slide.cta.href}
                        className="px-6 py-2.5 rounded-lg text-sm transition-all duration-150 active:scale-95"
                        style={{
                          background: '#ea580c',
                          color: '#ffffff',
                          fontFamily: 'var(--font-display)',
                          fontWeight: 600,
                        }}
                      >
                        {slide.cta.label}
                      </Link>
                      <Link
                        href="/products"
                        className="px-6 py-2.5 rounded-lg text-sm transition-all duration-150 active:scale-95"
                        style={{
                          background: slide.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
                          color: slide.dark ? '#ffffff' : '#1c1917',
                          fontFamily: 'var(--font-display)',
                          fontWeight: 500,
                          border: `1px solid ${slide.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                        }}
                      >
                        Frete grátis a partir de R$ 500
                      </Link>
                    </div>
                  </div>

                  {/* Imagem */}
                  <div
                    className="hidden sm:block flex-none relative"
                    style={{ width: 'clamp(260px, 30vw, 420px)', height: 'clamp(240px, 28vw, 380px)' }}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-contain object-bottom drop-shadow-2xl"
                      sizes="(max-width: 1280px) 30vw, 420px"
                      priority={slide.id === 1}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botão anterior */}
      <button
        onClick={scrollPrev}
        aria-label="Slide anterior"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150"
        style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.08)' }}
      >
        <ChevronLeft className="w-4 h-4 text-stone-700" />
      </button>

      {/* Botão próximo */}
      <button
        onClick={scrollNext}
        aria-label="Próximo slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150"
        style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.08)' }}
      >
        <ChevronRight className="w-4 h-4 text-stone-700" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Ir para slide ${i + 1}`}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: selected === i ? 28 : 6,
              background: selected === i ? '#ea580c' : 'rgba(255,255,255,0.5)',
            }}
          />
        ))}
      </div>
    </div>
  );
}