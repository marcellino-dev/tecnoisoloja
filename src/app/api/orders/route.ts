import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { CartItem, ShippingAddress } from '@/types';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const supabase  = createAdminClient();
  const isAdmin   = (session.user as any).role === 'admin';
  const userId    = (session.user as any).id;

  let query = supabase
    .from('orders')
    .select('*, user:users(name,email), items:order_items(*, product:products(name,images))')
    .order('created_at', { ascending: false });

  if (!isAdmin) query = query.eq('user_id', userId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { items, shipping_address }: { items: CartItem[]; shipping_address: ShippingAddress } = await req.json();
  if (!items?.length) return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });

  const total   = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const userId  = (session.user as any).id;
  const supabase = createAdminClient();

  // Cria o pedido
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({ user_id: userId, total, shipping_address, status: 'pending' })
    .select()
    .single();
  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });

  // Cria os itens do pedido
  const orderItems = items.map(i => ({
    order_id:      order.id,
    product_id:    i.product.id,
    product_name:  i.product.name,
    product_price: i.product.price,
    quantity:      i.quantity,
    subtotal:      i.product.price * i.quantity,
  }));

  const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 });

  // Integração PagSeguro
  try {
    const pagSeguroUrl = await createPagSeguroCheckout(order, items, shipping_address);
    await supabase.from('orders').update({ pagseguro_link: pagSeguroUrl }).eq('id', order.id);
    return NextResponse.json({ data: { ...order, pagseguro_link: pagSeguroUrl } }, { status: 201 });
  } catch (e: any) {
    // Mesmo sem PagSeguro, retorna o pedido criado
    return NextResponse.json({ data: order }, { status: 201 });
  }
}

async function createPagSeguroCheckout(order: any, items: CartItem[], address: ShippingAddress) {
  const baseUrl = process.env.PAGSEGURO_URL || 'https://sandbox.pagseguro.uol.com.br';
  const params  = new URLSearchParams({
    email: process.env.PAGSEGURO_EMAIL!,
    token: process.env.PAGSEGURO_TOKEN!,
    currency: 'BRL',
    reference: order.id,
    redirectURL:    `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${order.id}`,
    notificationURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/pagseguro`,
    'senderName':   address.name,
    'senderEmail':  address.email,
    'senderPhone':  address.phone?.replace(/\D/g, '') || '',
    'shippingAddressStreet':     address.street,
    'shippingAddressNumber':     address.number,
    'shippingAddressComplement': address.complement || '',
    'shippingAddressDistrict':   address.district,
    'shippingAddressCity':       address.city,
    'shippingAddressState':      address.state,
    'shippingAddressPostalCode': address.postal_code?.replace(/\D/g, '') || '',
    'shippingAddressCountry':    'BRA',
    'shippingType':              '3',
    'shippingCost':              '0.00',
  });

  items.forEach((item, i) => {
    const n = i + 1;
    params.set(`itemId${n}`,          item.product.id);
    params.set(`itemDescription${n}`, item.product.name.slice(0, 100));
    params.set(`itemAmount${n}`,      item.product.price.toFixed(2));
    params.set(`itemQuantity${n}`,    String(item.quantity));
  });

  const res = await fetch(`${baseUrl}/v2/checkout`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params.toString(),
  });

  const xml  = await res.text();
  const code = xml.match(/<code>(.+?)<\/code>/)?.[1];
  if (!code) throw new Error('PagSeguro: code não retornado');
  return `${baseUrl}/v2/checkout/payment.html?code=${code}`;
}
