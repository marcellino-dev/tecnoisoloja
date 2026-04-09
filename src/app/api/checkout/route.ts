import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { mpPreference } from '@/lib/mercadopago';
import { CartItem, ShippingAddress } from '@/types';

// Cria o pedido no banco e gera a preferencia de pagamento no Mercado Pago.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  const { items, shipping_address }: {
    items: CartItem[];
    shipping_address: ShippingAddress;
  } = await req.json();

  if (!items?.length) {
    return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
  }

  const userId   = (session.user as any).id;
  const total    = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const supabase = createAdminClient();

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({ user_id: userId, total, shipping_address, status: 'pending' })
    .select()
    .single();

  if (orderErr) {
    console.error('[checkout] Erro ao criar pedido:', orderErr);
    return NextResponse.json({ error: orderErr.message }, { status: 500 });
  }

  const orderItems = items.map(i => ({
    order_id:      order.id,
    product_id:    i.product.id,
    product_name:  i.product.name,
    product_price: i.product.price,
    quantity:      i.quantity,
    subtotal:      i.product.price * i.quantity,
  }));

  const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
  if (itemsErr) {
    console.error('[checkout] Erro ao registrar itens:', itemsErr);
    return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  try {
    const phoneDigits  = shipping_address.phone?.replace(/\D/g, '') || '';
    const appUrl       = process.env.NEXT_PUBLIC_APP_URL!;
    const isProduction = process.env.NODE_ENV === 'production';

    const preference = await mpPreference.create({
      body: {
        external_reference: order.id,
        items: items.map(i => ({
          id:          i.product.id,
          title:       i.product.name.slice(0, 256),
          quantity:    i.quantity,
          unit_price:  i.product.price,
          currency_id: 'BRL',
        })),
        payer: {
          name:  shipping_address.name,
          email: shipping_address.email,
          phone: {
            area_code: phoneDigits.slice(0, 2),
            number:    phoneDigits.slice(2),
          },
          address: {
            street_name:   shipping_address.street,
            street_number: String(parseInt(shipping_address.number) || 0),
            zip_code:      shipping_address.postal_code?.replace(/\D/g, '') || '',
          },
        },
        payment_methods: {
          excluded_payment_types: [],
          installments: 12,
        },
        back_urls: {
          success: `${appUrl}/checkout/success?order=${order.id}`,
          failure: `${appUrl}/checkout/failure?order=${order.id}`,
          pending: `${appUrl}/checkout/pending?order=${order.id}`,
        },
        ...(isProduction && { auto_return: 'approved' }),
        ...(isProduction && {
          notification_url: `${appUrl}/api/webhooks/mercadopago`,
        }),
        statement_descriptor: 'TECNOISO',
      },
    });

    await supabase
      .from('orders')
      .update({ mp_preference_id: preference.id })
      .eq('id', order.id);

    return NextResponse.json({
      data: {
        order_id:           order.id,
        preference_id:      preference.id,
        init_point:         preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
      },
    }, { status: 201 });

  } catch (err: any) {
    console.error('[checkout] Erro ao criar preferencia MP:', err);
    return NextResponse.json({
      data:  { order_id: order.id },
      error: 'Erro ao iniciar pagamento. Tente novamente.',
    }, { status: 500 });
  }
}