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
    <div className="py-10">
      <div className="container-custom">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-dark-500 mb-8">
          <Link href="/" className="hover:text-brand-400 transition-colors">Início</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products" className="hover:text-brand-400 transition-colors">Produtos</Link>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand-400 transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-dark-300 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-dark-700 rounded-xl overflow-hidden">
              <Image
                src={product.images?.[0] || `https://via.placeholder.com/600x600/1a1a2e/ea580c?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {discount && (
                <div className="absolute top-4 left-4 badge bg-brand-600 text-white text-sm">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((img: string, i: number) => (
                  <div key={i} className="aspect-square bg-dark-700 rounded-lg overflow-hidden relative">
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="100px" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.category && (
              <p className="text-xs font-mono text-brand-500 tracking-widest uppercase mb-2">
                {product.category.name}
              </p>
            )}
            <h1 className="font-display font-800 text-3xl text-white leading-tight mb-3">
              {product.name}
            </h1>

            {product.sku && (
              <p className="text-xs text-dark-500 font-mono mb-4">SKU: {product.sku}</p>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-6">
              <span className="font-display font-800 text-4xl text-white">
                {formatPrice(product.price)}
              </span>
              {product.compare_price && (
                <span className="text-dark-500 line-through text-lg mb-1">
                  {formatPrice(product.compare_price)}
                </span>
              )}
              {discount && (
                <span className="badge bg-brand-600/20 text-brand-400 mb-1">
                  Economize {discount}%
                </span>
              )}
            </div>

            {/* Short description */}
            {product.short_description && (
              <p className="text-dark-300 leading-relaxed mb-6 border-l-2 border-brand-600 pl-4">
                {product.short_description}
              </p>
            )}

            {/* Add to cart */}
            <AddToCartSection product={product} />

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-dark-700">
              {[
                { icon: Shield, label: 'Garantia de fábrica' },
                { icon: Truck,  label: 'Entrega para todo o Brasil' },
                { icon: Package, label: 'Embalagem segura' },
              ].map(b => (
                <div key={b.label} className="flex flex-col items-center gap-1.5 text-center">
                  <b.icon className="w-5 h-5 text-brand-500" />
                  <span className="text-xs text-dark-400">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description + Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
          <div className="lg:col-span-2 card p-6">
            <h2 className="font-display font-700 text-white text-xl mb-4">Descrição</h2>
            <p className="text-dark-300 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {specs && Object.keys(specs).length > 0 && (
            <div className="card p-6">
              <h2 className="font-display font-700 text-white text-xl mb-4">Especificações</h2>
              <dl className="space-y-3">
                {Object.entries(specs).map(([key, val]) => (
                  <div key={key} className="flex flex-col">
                    <dt className="text-xs font-mono text-dark-500 uppercase tracking-wider">{key}</dt>
                    <dd className="text-sm text-dark-200 mt-0.5">{val}</dd>
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
