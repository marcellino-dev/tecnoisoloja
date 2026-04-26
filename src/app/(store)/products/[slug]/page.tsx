import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { AddToCartSection } from '@/components/shop/AddToCartSection';
import { formatPrice } from '@/lib/utils';
import { Package, Shield, Truck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

interface Props { params: { slug: string } }

async function getProduct(slug: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('active', true)
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Produto não encontrado' };
  return {
    title: product.name,
    description: product.short_description || product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;

  const specs = product.specs as Record<string, string> | null;

  return (
    <div className="py-10 bg-gray-50 min-h-screen">
      <div className="container-custom">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#E63946] transition-colors">Início</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products" className="hover:text-[#E63946] transition-colors">Produtos</Link>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#E63946] transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-500 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <Image
                src={product.images?.[0] || `https://via.placeholder.com/600x600/f9fafb/E63946?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
                fill
                className="object-contain p-6"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {discount && (
                <div className="absolute top-4 left-4 px-2 py-1 bg-[#E63946] text-white text-xs font-bold rounded">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((img: string, i: number) => (
                  <div key={i} className="aspect-square bg-white rounded-lg overflow-hidden relative border border-gray-200">
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-contain p-2" sizes="100px" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            {product.category && (
              <p className="text-xs font-mono text-[#E63946] tracking-widest uppercase mb-2">
                {product.category.name}
              </p>
            )}
            <h1 className="font-display font-800 text-3xl text-gray-900 leading-tight mb-3">
              {product.name}
            </h1>

            {product.sku && (
              <p className="text-xs text-gray-400 font-mono mb-4">SKU: {product.sku}</p>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-6 pb-6 border-b border-gray-100">
              <span className="font-display font-800 text-4xl text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.compare_price && (
                <span className="text-gray-400 line-through text-lg mb-1">
                  {formatPrice(product.compare_price)}
                </span>
              )}
              {discount && (
                <span className="px-2 py-0.5 bg-red-50 text-[#E63946] text-xs font-bold rounded-full border border-red-100 mb-1">
                  Economize {discount}%
                </span>
              )}
            </div>

            {/* Short description */}
            {product.short_description && (
              <p className="text-gray-600 leading-relaxed mb-6 border-l-2 border-[#E63946] pl-4">
                {product.short_description}
              </p>
            )}

            {/* Add to cart */}
            <AddToCartSection product={product} />

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
              {[
                { icon: Shield,  label: 'Garantia de fábrica' },
                { icon: Truck,   label: 'Entrega para todo o Brasil' },
                { icon: Package, label: 'Embalagem segura' },
              ].map(b => (
                <div key={b.label} className="flex flex-col items-center gap-1.5 text-center">
                  <b.icon className="w-5 h-5 text-[#E63946]" />
                  <span className="text-xs text-gray-500">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description + Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-display font-700 text-gray-900 text-xl mb-4">Descrição</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {specs && Object.keys(specs).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="font-display font-700 text-gray-900 text-xl mb-4">Especificações</h2>
              <dl className="space-y-3">
                {Object.entries(specs).map(([key, val]) => (
                  <div key={key} className="flex flex-col pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <dt className="text-xs font-mono text-gray-400 uppercase tracking-wider">{key}</dt>
                    <dd className="text-sm text-gray-700 mt-0.5 font-500">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}