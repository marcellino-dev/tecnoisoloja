'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product } from '@/types';

interface Props {
  products: Product[];
}

export function ProductCarousel({ products }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 3800, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!products.length) return null;

  const btnBase: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    width: 40, height: 40,
    borderRadius: '50%',
    background: '#fff',
    border: '1.5px solid #e5e7eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#374151',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ position: 'relative', paddingLeft: 24, paddingRight: 24 }}>
      <button
        onClick={scrollPrev}
        style={{ ...btnBase, left: -4 }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#E63946';
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#E63946';
          (e.currentTarget as HTMLButtonElement).style.color = '#fff';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(230,57,70,0.3)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#fff';
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
          (e.currentTarget as HTMLButtonElement).style.color = '#374151';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
      >
        <ChevronLeft style={{ width: 18, height: 18 }} />
      </button>

      <button
        onClick={scrollNext}
        style={{ ...btnBase, right: -4 }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#E63946';
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#E63946';
          (e.currentTarget as HTMLButtonElement).style.color = '#fff';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(230,57,70,0.3)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#fff';
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
          (e.currentTarget as HTMLButtonElement).style.color = '#374151';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
      >
        <ChevronRight style={{ width: 18, height: 18 }} />
      </button>

      <div style={{ overflow: 'hidden' }} ref={emblaRef}>
        <div style={{ display: 'flex', gap: 16 }}>
          {products.map((product, i) => (
            <div
              key={product.id}
              style={{ flex: 'none', width: 'calc(50% - 8px)' }}
              className="sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
            >
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}