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
  const body = await req.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('products')
    .update(body)
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
