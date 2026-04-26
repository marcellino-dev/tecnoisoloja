import Link from 'next/link';
import { ProductCarousel } from '@/components/shop/ProductCarousel';
import { HeroCarousel } from '@/components/shop/HeroCarousel';
import { createAdminClient } from '@/lib/supabase/server';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

// força dados frescos a cada requisição — sem cache nenhum
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getAllProducts(): Promise<Product[]> {
  try {
    const supabase = createAdminClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) console.error('[getAllProducts]', error.message);
    return data || [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = createAdminClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('active', true)
      .eq('featured', true)
      .limit(12);
    if (error) console.error('[getFeaturedProducts]', error.message);
    return data || [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function getOfferProducts(): Promise<Product[]> {
  try {
    const supabase = createAdminClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('active', true)
      .not('compare_price', 'is', null)
      .order('compare_price', { ascending: false })
      .limit(5);
    if (error) console.error('[getOfferProducts]', error.message);
    return data || [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

function ProductCard({ product }: { product: Product }) {
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col"
    >
      <div className="relative aspect-square bg-white p-4">
        {discount && (
          <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-[#00a650] text-white text-xs font-700 rounded">
            -{discount}%
          </span>
        )}
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain p-3"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            Sem imagem
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 border-t border-gray-100">
        <p className="text-sm text-gray-700 line-clamp-2 mb-2 leading-snug flex-1">
          {product.name}
        </p>
        {product.compare_price && (
          <p className="text-xs text-gray-400 line-through">
            R$ {product.compare_price.toFixed(2).replace('.', ',')}
          </p>
        )}
        <p className="font-700 text-xl text-gray-900 leading-tight">
          {formatPrice(product.price)}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">em 12x sem juros</p>
        <p className="text-xs text-[#00a650] font-500 mt-1">Frete grátis</p>
      </div>
    </Link>
  );
}

const BENEFITS = [
  { title: 'Frete',         desc: 'Acima de R$ 500' },
  { title: 'Garantia',      desc: '12 meses em todos os produtos' },
  { title: '12x Sem Juros', desc: 'Em todos os produtos' },
  { title: 'Suporte',       desc: 'Atendimento especializado' },
];

const CATEGORIES = [
  { name: 'Termômetros', slug: 'termometros',  image: '/termometro.png' },
  { name: 'Manômetros',  slug: 'manometros',   image: '/manometro.png' },
  { name: 'Multímetros', slug: 'analisadores', image: '/multimetro.png' },
  { name: 'Paquímetros', slug: 'calibradores', image: '/paquimetro.png' },
  { name: 'Dataloggers', slug: 'dataloggers',  image: '/termohigrometro.png' },
  { name: 'EPIs',        slug: 'epis',         image: '/termometro.png' },
];

export default async function HomePage() {
  const [allProducts, featured, offers] = await Promise.all([
    getAllProducts(),
    getFeaturedProducts(),
    getOfferProducts(),
  ]);

  return (
    <div className="overflow-x-hidden bg-gray-50">

      <HeroCarousel />

      {/* BENEFÍCIOS */}
      <section className="bg-white border-b border-gray-200">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex items-center gap-4 px-6 py-5">
                <div>
                  <p className="font-700 text-gray-800 text-sm">{b.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {offers.length > 0 && (
        <section className="py-8 bg-white mt-3">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-700 text-xl text-gray-900">Ofertas do Dia</h2>
              <Link href="/products?offer=true" className="text-sm text-[#00a650] hover:underline font-500">
                Ver todas as ofertas →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {offers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="py-8 bg-white mt-3">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-700 text-xl text-gray-900">Mais Vendidos</h2>
              <Link href="/products" className="text-sm text-[#00a650] hover:underline font-500">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIAS */}
      <section className="py-8 bg-white mt-3">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-700 text-xl text-gray-900">Categorias</h2>
            <Link href="/products" className="text-sm text-[#00a650] hover:underline font-500">
              Ver todas →
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

      {allProducts.length > 0 && (
        <section className="py-8 bg-white mt-3">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-700 text-xl text-gray-900">Produtos</h2>
              <Link href="/products" className="text-sm text-[#00a650] hover:underline font-500">
                Ver catálogo completo →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {featured.length > 4 && (
        <section className="py-8 bg-white mt-3">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-700 text-xl text-gray-900">Produtos em Destaque</h2>
              <Link href="/products?featured=true" className="text-sm text-[#00a650] hover:underline font-500">
                Ver todos →
              </Link>
            </div>
            <ProductCarousel products={featured} />
          </div>
        </section>
      )}

    </div>
  );
}