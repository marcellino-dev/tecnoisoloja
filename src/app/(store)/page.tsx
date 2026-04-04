import Link from 'next/link';
import { ArrowRight, Shield, Truck, CreditCard, Headphones } from 'lucide-react';
import { ProductCarousel } from '@/components/shop/ProductCarousel';
import { HeroCarousel } from '@/components/shop/HeroCarousel';
import { createAdminClient } from '@/lib/supabase/server';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = createAdminClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('active', true)
      .eq('featured', true)
      .limit(12);
    return data || [];
  } catch (error) {
    console.error('Supabase error:', error);
    return [];
  }
}

async function getOfferProducts(): Promise<Product[]> {
  try {
    const supabase = createAdminClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('active', true)
      .not('compare_price', 'is', null)
      .order('compare_price', { ascending: false })
      .limit(5);
    return data || [];
  } catch (error) {
    console.error('Supabase error:', error);
    return [];
  }
}

const BENEFITS = [
  { icon: Truck,       title: 'Frete',        desc: 'Acima de R$ 500' },
  { icon: Shield,      title: 'Garantia',      desc: '12 meses em todos os produtos' },
  { icon: CreditCard,  title: '12x Sem Juros', desc: 'Em todos os produtos' },
  { icon: Headphones,  title: 'Suporte',       desc: 'Atendimento especializado' },
];

const CATEGORIES = [
  { name: 'Termômetros',  slug: 'termometros',  image: '/termometro.png' },
  { name: 'Manômetros',   slug: 'manometros',   image: '/manometro.png' },
  { name: 'Multímetros',  slug: 'analisadores', image: '/multimetro.png' },
  { name: 'Paquímetros',  slug: 'calibradores', image: '/paquimetro.png' },
  { name: 'Dataloggers',  slug: 'dataloggers',  image: '/termohigrometro.png' },
  { name: 'EPIs',         slug: 'epis',         image: '/termometro.png' },
];

export default async function HomePage() {
  const [featured, offers] = await Promise.all([
    getFeaturedProducts(),
    getOfferProducts(),
  ]);

  return (
    <div className="overflow-x-hidden bg-gray-50">

      {/* ===== HERO CARROSSEL ===== */}
      <HeroCarousel />

      {/* ===== BENEFÍCIOS ===== */}
      <section className="bg-white border-b border-gray-200">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex items-center gap-4 px-6 py-5">
                <div className="w-10 h-10 flex-none flex items-center justify-center text-gray-400">
                  <b.icon className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-display font-700 text-gray-800 text-sm">{b.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OFERTAS DO DIA ===== */}
      {offers.length > 0 && (
        <section className="py-8 bg-white mt-3">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-700 text-xl text-gray-900">Ofertas do Dia</h2>
              <Link href="/products?offer=true" className="text-sm text-[#00a650] hover:underline font-500 flex items-center gap-1">
                Ver todas as ofertas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {offers.map((product) => {
                const discount = product.compare_price
                  ? Math.round((1 - product.price / product.compare_price) * 100)
                  : null;
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col"
                  >
                    {/* Badge desconto */}
                    {discount && (
                      <span className="self-start mb-2 px-2 py-0.5 bg-[#00a650] text-white text-xs font-700 rounded">
                        - {discount} %
                      </span>
                    )}

                    {/* Imagem */}
                    <div className="relative h-36 mb-3">
                      <Image
                        src={product.images?.[0] || `https://via.placeholder.com/200x150/f5f5f5/999?text=${encodeURIComponent(product.name)}`}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="200px"
                      />
                    </div>

                    {/* Nome */}
                    <p className="text-xs text-gray-700 line-clamp-2 mb-2 flex-1">{product.name}</p>

                    {/* Preço riscado */}
                    {product.compare_price && (
                      <p className="text-xs text-gray-400 line-through">
                        R$ {product.compare_price.toFixed(2).replace('.', ',')}
                      </p>
                    )}

                    {/* Preço atual */}
                    <p className="font-display font-700 text-lg text-gray-900">
                      {formatPrice(product.price)}
                    </p>

                    <p className="text-xs text-gray-500 mt-0.5">
                      em 12x sem juros
                    </p>
                    <p className="text-xs text-[#00a650] font-500 mt-0.5">Frete grátis</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== MAIS VENDIDOS ===== */}
      {featured.length > 0 && (
        <section className="py-8 bg-white mt-3">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-700 text-xl text-gray-900">Mais Vendidos</h2>
              <Link href="/products" className="text-sm text-[#00a650] hover:underline font-500 flex items-center gap-1">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col"
                >
                  <div className="relative h-48 mb-4">
                    <Image
                      src={product.images?.[0] || `https://via.placeholder.com/300x200/f5f5f5/999?text=${encodeURIComponent(product.name)}`}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="300px"
                    />
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 mb-3 flex-1">{product.name}</p>
                  <p className="font-display font-700 text-xl text-gray-900">{formatPrice(product.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CATEGORIAS ===== */}
      <section className="py-8 bg-white mt-3">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-700 text-xl text-gray-900">Categorias</h2>
            <Link href="/products" className="text-sm text-[#00a650] hover:underline font-500 flex items-center gap-1">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 group"
              >
                <div className="relative w-16 h-16">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-200"
                    sizes="64px"
                  />
                </div>
                <span className="text-xs font-500 text-gray-700 text-center leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DESTAQUES CARROSSEL ===== */}
      {featured.length > 4 && (
        <section className="py-8 bg-white mt-3">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-700 text-xl text-gray-900">Produtos em Destaque</h2>
              <Link href="/products?featured=true" className="text-sm text-[#00a650] hover:underline font-500 flex items-center gap-1">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductCarousel products={featured} />
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="py-10 mt-3">
        <div className="container-custom">
          <div className="relative bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl overflow-hidden p-10 md:p-16 text-center glow-orange">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-white/10 blur-3xl rounded-full" />
            <div className="relative z-10">
              <p className="text-xs font-mono text-white/70 tracking-widest uppercase mb-3">Pronto para começar?</p>
              <h2 className="font-display font-800 text-3xl md:text-4xl text-white mb-4">
                Encontre o instrumento ideal para sua operação
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Explore nosso catálogo completo ou entre em contato com nossos especialistas para uma consultoria personalizada.
              </p>
              <Link href="/products" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-brand-600 font-display font-700 rounded-lg hover:bg-gray-50 transition-all text-base">
                Explorar Catálogo <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}