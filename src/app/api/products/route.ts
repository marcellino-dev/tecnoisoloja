import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/products - Lista produtos
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const featured  = searchParams.get('featured');
  const category  = searchParams.get('category');
  const search    = searchParams.get('search');
  const limit     = parseInt(searchParams.get('limit') || '20');
  const page      = parseInt(searchParams.get('page')  || '1');
  const offset    = (page - 1) * limit;

  const supabase = createAdminClient();
  let query = supabase
    .from('products')
    .select('*, category:categories(*)', { count: 'exact' })
    .eq('active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (featured === 'true') query = query.eq('featured', true);
  if (category)            query = query.eq('categories.slug', category);
  if (search)              query = query.ilike('name', `%${search}%`);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count, page, limit });
}

// POST /api/products - Cria produto (admin)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await req.json();
  const supabase = createAdminClient();
  const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const { data, error } = await supabase
    .from('products')
    .insert({ ...body, slug })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
