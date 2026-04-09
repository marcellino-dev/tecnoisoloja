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
    [Autoplay({ delay: 3500, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!products.length) return null;

  return (
    <div className="relative px-6">
      <button
        onClick={scrollPrev}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-dark-800 border border-dark-600 flex items-center justify-center text-white hover:bg-brand-600 hover:border-brand-600 transition-all duration-200 shadow-lg"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-dark-800 border border-dark-600 flex items-center justify-center text-white hover:bg-brand-600 hover:border-brand-600 transition-all duration-200 shadow-lg"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="flex-none w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
            >
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
