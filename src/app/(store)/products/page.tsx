import { Suspense } from 'react';
import { createAdminClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/ProductCard';
import { Product } from '@/types';
import { Search, SlidersHorizontal } from 'lucide-react';

interface Props {
  searchParams: { category?: string; search?: string; featured?: string; page?: string };
}

async function getProducts(params: Props['searchParams']): Promise<{ data: Product[]; count: number }> {
  const supabase = createAdminClient();
  const page   = parseInt(params.page || '1');
  const limit  = 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('products')
    .select('*, category:categories(*)', { count: 'exact' })
    .eq('active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (params.featured === 'true') query = query.eq('featured', true);
  if (params.search) query = query.ilike('name', `%${params.search}%`);

  const { data, count } = await query;
  return { data: data || [], count: count || 0 };
}

async function getCategories() {
  const supabase = createAdminClient();
  const { data } = await supabase.from('categories').select('*').order('name');
  return data || [];
}

export const metadata = { title: 'Produtos' };

export default async function ProductsPage({ searchParams }: Props) {
  const [{ data: products, count }, categories] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
  ]);

  return (
    <div className="py-10">
      <div className="container-custom">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-mono text-brand-500 tracking-widest uppercase mb-1">Catálogo</p>
          <h1 className="section-title">
            {searchParams.search ? `Resultados para "${searchParams.search}"` : 'Todos os Produtos'}
          </h1>
          <p className="text-dark-400 mt-2">{count} produto{count !== 1 ? 's' : ''} encontrado{count !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <aside className="lg:w-56 shrink-0">
            <div className="card p-4 sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-4 h-4 text-brand-500" />
                <span className="font-display font-700 text-sm text-white">Filtros</span>
              </div>

              {/* Search */}
              <form method="GET" className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <input
                    type="text"
                    name="search"
                    defaultValue={searchParams.search || ''}
                    placeholder="Buscar produtos..."
                    className="input pl-9 text-sm py-2.5"
                  />
                </div>
              </form>

              {/* Categories */}
              <div>
                <p className="text-xs font-mono text-dark-500 tracking-wider uppercase mb-2">Categorias</p>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="/products"
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!searchParams.category ? 'bg-brand-600/20 text-brand-400 font-600' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}
                    >
                      Todas
                    </a>
                  </li>
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <a
                        href={`/products?category=${cat.slug}`}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${searchParams.category === cat.slug ? 'bg-brand-600/20 text-brand-400 font-600' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}
                      >
                        {cat.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-display font-700 text-white text-xl mb-2">Nenhum produto encontrado</h3>
                <p className="text-dark-400">Tente ajustar seus filtros ou busca</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
