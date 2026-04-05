// CAMINHO: src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', params.id)
    .single();

  if (error) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body     = await req.json();
  const supabase = createAdminClient();

  // ✅ mesma validação do POST — garante tipos corretos antes de salvar
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
    active:            body.active === true || body.active === 'true',
  };

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('products').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Produto removido' });
}