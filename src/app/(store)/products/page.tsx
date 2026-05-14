import { createAdminClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/ProductCard';
import { Product } from '@/types';
import { Search, SlidersHorizontal, ChevronRight, Package } from 'lucide-react';

interface SearchParamsType {
  category?: string;
  search?: string;
  featured?: string;
  offer?: string;
  page?: string;
}

interface Props {
  searchParams: Promise<SearchParamsType>;
}

async function getProducts(params: SearchParamsType): Promise<{ data: Product[]; count: number }> {
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

  if (params.category) {
    const supabase2 = createAdminClient();
    const { data: cat } = await supabase2
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single();
    if (cat?.id) {
      query = query.eq('category_id', cat.id);
    } else {
      return { data: [], count: 0 };
    }
  }

  if (params.featured === 'true') query = query.eq('featured', true);
  if (params.offer === 'true')    query = query.not('compare_price', 'is', null);
  if (params.search)              query = query.ilike('name', `%${params.search}%`);

  const { data, count, error } = await query;
  if (error) console.error('[getProducts]', error.message);
  return { data: data || [], count: count || 0 };
}

async function getCategories() {
  const supabase = createAdminClient();
  const { data } = await supabase.from('categories').select('*').order('name');
  return data || [];
}

export const metadata = { title: 'Produtos | Tecnoiso' };

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;

  const [{ data: products, count }, categories] = await Promise.all([
    getProducts(sp),
    getCategories(),
  ]);

  const activeCategory = categories.find((c: any) => c.slug === sp.category);
  const currentPage    = parseInt(sp.page || '1');
  const totalPages     = Math.ceil(count / 12);

  const pageTitle = sp.search
    ? `Resultados para "${sp.search}"`
    : activeCategory?.name ?? 'Todos os Produtos';

  return (
    <div style={{ background: '#f6f6f6', minHeight: '100vh', paddingBottom: 64 }}>
      <div className="container-custom" style={{ paddingTop: 24 }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, fontSize: 12 }}>
          <a href="/" style={{ color: '#007185', textDecoration: 'none' }}>Início</a>
          <ChevronRight style={{ width: 12, height: 12, color: '#565959' }} />
          <a href="/products" style={{ color: '#007185', textDecoration: 'none' }}>Produtos</a>
          {activeCategory && (
            <>
              <ChevronRight style={{ width: 12, height: 12, color: '#565959' }} />
              <span style={{ color: '#565959' }}>{activeCategory.name}</span>
            </>
          )}
        </nav>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

          {/* Sidebar */}
          <aside style={{ width: 220, flexShrink: 0, position: 'sticky', top: 20 }}>

            {/* Search */}
            <form method="GET" style={{ marginBottom: 12 }}>
              {sp.category && (
                <input type="hidden" name="category" value={sp.category} />
              )}
              <div style={{ position: 'relative' }}>
                <Search style={{
                  position: 'absolute', left: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  width: 14, height: 14, color: '#6b7280', pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  name="search"
                  defaultValue={sp.search || ''}
                  placeholder="Buscar produtos..."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    paddingLeft: 32, paddingRight: 12,
                    paddingTop: 8, paddingBottom: 8,
                    fontSize: 13,
                    border: '1px solid #d5d9d9',
                    borderRadius: 6, outline: 'none',
                    background: '#fff', color: '#111',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </form>

            {/* Category list */}
            <div style={{
              background: '#fff',
              border: '1px solid #d5d9d9',
              borderRadius: 6,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '10px 14px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <SlidersHorizontal style={{ width: 13, height: 13, color: '#565959' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
                  Departamentos
                </span>
              </div>

              <ul style={{ listStyle: 'none', margin: 0, padding: '6px 0' }}>
                {[{ id: 'all', name: 'Todos os produtos', slug: '' }, ...categories].map((cat: any) => {
                  const isActive = cat.slug === '' ? !sp.category : sp.category === cat.slug;
                  return (
                    <li key={cat.id}>
                      <a
                        href={cat.slug ? `/products?category=${cat.slug}` : '/products'}
                        style={{
                          display: 'block',
                          padding: '7px 14px',
                          fontSize: 13,
                          fontWeight: isActive ? 700 : 400,
                          color: isActive ? '#C7511F' : '#111',
                          textDecoration: 'none',
                          borderLeft: isActive ? '3px solid #C7511F' : '3px solid transparent',
                          background: isActive ? '#fff8f4' : 'transparent',
                        }}
                      >
                        {cat.name}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Main */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Results bar */}
            <div style={{
              background: '#fff',
              border: '1px solid #d5d9d9',
              borderRadius: 6,
              padding: '10px 16px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}>
              <span style={{ fontSize: 13, color: '#565959' }}>
                {count > 0 ? (
                  <>
                    <span style={{ color: '#C7511F', fontWeight: 700 }}>{count}</span>
                    {' '}resultado{count !== 1 ? 's' : ''} em{' '}
                    <strong style={{ color: '#111' }}>{pageTitle}</strong>
                  </>
                ) : (
                  <>Nenhum resultado em <strong style={{ color: '#111' }}>{pageTitle}</strong></>
                )}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#565959' }}>Ordenar por:</span>
                <select style={{
                  fontSize: 12,
                  border: '1px solid #d5d9d9',
                  borderRadius: 4,
                  padding: '4px 8px',
                  background: '#fff',
                  color: '#111',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}>
                  <option>Mais recentes</option>
                  <option>Menor preco</option>
                  <option>Maior preco</option>
                  <option>Mais vendidos</option>
                </select>
              </div>
            </div>

            {/* Empty state */}
            {products.length === 0 ? (
              <div style={{
                background: '#fff',
                border: '1px solid #d5d9d9',
                borderRadius: 6,
                padding: '64px 24px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: '#f3f4f6', border: '1px solid #e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Package style={{ width: 24, height: 24, color: '#9ca3af' }} />
                </div>
                <p style={{ fontSize: 17, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>
                  Nenhum produto encontrado
                </p>
                <p style={{ fontSize: 13, color: '#565959', margin: '0 0 24px', maxWidth: 340, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                  {sp.search
                    ? `Nao encontramos resultados para "${sp.search}" nesta categoria.`
                    : 'Esta categoria ainda nao possui produtos cadastrados. Confira os outros departamentos.'}
                </p>
                <a
                  href="/products"
                  style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    background: '#FFD814',
                    border: '1px solid #FCD200',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#111',
                    textDecoration: 'none',
                  }}
                >
                  Ver todos os produtos
                </a>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 12,
              }}>
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 4 }}>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => {
                  const params = new URLSearchParams({
                    ...(sp.category ? { category: sp.category } : {}),
                    ...(sp.search   ? { search: sp.search }     : {}),
                    page: String(p),
                  });
                  return (
                    <a
                      key={p}
                      href={`/products?${params.toString()}`}
                      style={{
                        width: 36, height: 36,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid',
                        borderColor: p === currentPage ? '#C7511F' : '#d5d9d9',
                        borderRadius: 4,
                        background: p === currentPage ? '#fff8f4' : '#fff',
                        color: p === currentPage ? '#C7511F' : '#111',
                        fontSize: 13,
                        fontWeight: p === currentPage ? 700 : 400,
                        textDecoration: 'none',
                      }}
                    >
                      {p}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}