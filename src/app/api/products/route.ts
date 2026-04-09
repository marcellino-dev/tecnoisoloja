// CAMINHO: src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get('featured');
  const search   = searchParams.get('search');
  const limit    = parseInt(searchParams.get('limit') || '20');
  const page     = parseInt(searchParams.get('page')  || '1');
  const offset   = (page - 1) * limit;

  const supabase = createAdminClient();
  let query = supabase
    .from('products')
    .select('*, category:categories(*)', { count: 'exact' })
    .eq('active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (featured === 'true') query = query.eq('featured', true);
  if (search)              query = query.ilike('name', `%${search}%`);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body     = await req.json();
  const supabase = createAdminClient();

  // Gera slug único
  const baseSlug = body.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', baseSlug)
    .maybeSingle();

  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

  // ✅ CORREÇÃO: garante tipos corretos — active e featured sempre boolean
  const payload = {
    name:              String(body.name),
    description:       String(body.description),
    short_description: body.short_description ? String(body.short_description) : null,
    price:             parseFloat(body.price),
    compare_price:     body.compare_price ? parseFloat(body.compare_price) : null,
    stock:             parseInt(body.stock),
    sku:               body.sku ? String(body.sku) : null,
    category_id:       body.category_id ? String(body.category_id) : null,
    images:            Array.isArray(body.images) ? body.images : [],
    featured:          body.featured === true || body.featured === 'true',
    active:            body.active === true || body.active === 'true', // ✅ nunca vira null/undefined
    slug,
  };

  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[POST /api/products]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
