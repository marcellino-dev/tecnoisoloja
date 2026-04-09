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
    bg: 'from-yellow-300 to-yellow-100',
    tag: 'Lançamento',
    title: 'Manômetros',
    subtitle: 'Digital',
    desc: 'Frete grátis a partir de R$ 500',
    cta: { label: 'Ver Produtos', href: '/products?category=manometros' },
    image: '/manometro.png',
    textColor: 'text-dark-900',
  },
  {
    id: 2,
    bg: 'from-orange-500 to-orange-300',
    tag: 'Mais Vendido',
    title: 'Multímetros',
    subtitle: 'Profissional',
    desc: 'Até 15% de desconto na primeira compra',
    cta: { label: 'Aproveitar', href: '/products?category=analisadores' },
    image: '/multimetro.png',
    textColor: 'text-white',
  },
  {
    id: 3,
    bg: 'from-blue-600 to-blue-400',
    tag: 'Precisão',
    title: 'Termômetros',
    subtitle: 'Industriais',
    desc: 'Equipamentos certificados com garantia de fábrica',
    cta: { label: 'Explorar', href: '/products?category=termometros' },
    image: '/termometro.png',
    textColor: 'text-white',
  },
  {
    id: 4,
    bg: 'from-green-600 to-green-400',
    tag: 'Novidade',
    title: 'Termohigrômetros',
    subtitle: 'Alta Precisão',
    desc: 'Monitoramento de temperatura e umidade',
    cta: { label: 'Conhecer', href: '/products?category=analisadores' },
    image: '/termohigrometro.png',
    textColor: 'text-white',
  },
  {
    id: 5,
    bg: 'from-slate-700 to-slate-500',
    tag: 'Promoção',
    title: 'Paquímetros',
    subtitle: 'Digitais',
    desc: 'Medição com precisão de 0,01mm',
    cta: { label: 'Ver Oferta', href: '/products?category=calibradores' },
    image: '/paquimetro.png',
    textColor: 'text-white',
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
    <div className="relative w-full overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {SLIDES.map((slide) => (
            <div key={slide.id} className="flex-none w-full">
              <div className={`relative w-full h-[480px] sm:h-[520px] bg-gradient-to-r ${slide.bg} flex items-center`}>

                {/* Conteúdo */}
                <div className="container-custom relative z-10 flex items-center justify-between w-full">
                  <div className="max-w-lg">
                    {/* Tag */}
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-700 mb-4 ${
                      slide.textColor === 'text-white'
                        ? 'bg-white/20 text-white'
                        : 'bg-dark-900/10 text-dark-800'
                    }`}>
                      {slide.tag}
                    </span>

                    <h2 className={`font-display font-800 text-5xl sm:text-6xl leading-tight ${slide.textColor}`}>
                      {slide.title}
                      <br />
                      <span className="font-900">{slide.subtitle}</span>
                    </h2>

                    <p className={`mt-4 text-base font-500 ${
                      slide.textColor === 'text-white' ? 'text-white/80' : 'text-dark-700'
                    }`}>
                      {slide.desc}
                    </p>

                    <p className={`mt-1 text-xs ${
                      slide.textColor === 'text-white' ? 'text-white/50' : 'text-dark-500'
                    }`}>
                      *Consulte Termos e Condições. Imagens ilustrativas.
                    </p>

                    <div className="flex flex-wrap gap-3 mt-6">
                      <Link
                        href={slide.cta.href}
                        className="px-7 py-3 bg-[#1a6db5] hover:bg-[#1558a0] text-white rounded-full font-700 text-sm transition-all hover:shadow-lg"
                      >
                        {slide.cta.label}
                      </Link>
                      <Link
                        href="/products"
                        className={`px-7 py-3 rounded-full font-700 text-sm border-2 transition-all ${
                          slide.textColor === 'text-white'
                            ? 'border-white text-white hover:bg-white/10'
                            : 'border-dark-800 text-dark-800 hover:bg-dark-900/10'
                        }`}
                      >
                        Frete grátis a partir de R$ 500
                      </Link>
                    </div>
                  </div>

                  {/* Imagem do produto */}
                  <div className="hidden sm:flex flex-none items-end justify-center w-[420px] h-[380px] relative">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-contain object-bottom drop-shadow-2xl"
                      sizes="420px"
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
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all"
      >
        <ChevronLeft className="w-5 h-5 text-dark-800" />
      </button>

      {/* Botão próximo */}
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all"
      >
        <ChevronRight className="w-5 h-5 text-dark-800" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              selected === i ? 'w-8 bg-[#1a6db5]' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
