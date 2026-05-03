// app/api/addresses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json([], { status: 401 });

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('addresses')
    .select('id, label, zip, street, number, complement, neighborhood, city, state, is_default')
    .eq('user_id', session.user.id)
    .order('is_default', { ascending: false })
    .order('created_at',  { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { label, zip, street, number, complement, neighborhood, city, state, is_default } = await req.json();

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id:      session.user.id,
      label:        label        || 'Casa',
      zip:          zip          || '',
      street:       street       || '',
      number:       number       || '',
      complement:   complement   || '',
      neighborhood: neighborhood || '',
      city:         city         || '',
      state:        state        || '',
      is_default:   is_default   ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}