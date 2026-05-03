// src/app/api/orders/[id]/cancel/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  // 1. Autenticação
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  const userId  = (session.user as any).id;
  const orderId = params.id;

  const supabase = createAdminClient();

  // 2. Busca o pedido garantindo que pertence ao usuário
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, status, created_at, mercadopago_payment_id')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error || !order) {
    return NextResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 });
  }

  // 3. Só cancela se estiver pending
  if (order.status !== 'pending') {
    return NextResponse.json(
      { message: 'Apenas pedidos com pagamento pendente podem ser cancelados.' },
      { status: 422 },
    );
  }

  // 4. Janela de 24h
  const age = Date.now() - new Date(order.created_at).getTime();
  if (age > CANCEL_WINDOW_MS) {
    return NextResponse.json(
      { message: 'O prazo de cancelamento de 24h expirou. Acione o suporte.' },
      { status: 422 },
    );
  }

  // 5. Cancela no Mercado Pago (se houver payment_id)
  if (order.mercadopago_payment_id) {
    try {
      const mpRes = await fetch(
        `https://api.mercadopago.com/v1/payments/${order.mercadopago_payment_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({ status: 'cancelled' }),
        },
      );

      if (!mpRes.ok) {
        const mpBody = await mpRes.json().catch(() => ({}));
        console.error('[cancel] MP error:', mpBody);
        // Não bloqueia — o webhook vai sincronizar o status depois
      }
    } catch (err) {
      console.error('[cancel] MP fetch error:', err);
    }
  }

  // 6. Atualiza o status no banco para `cancelled`
  //    O webhook do MP também vai confirmar isso, mas antecipamos para UX
  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (updateError) {
    console.error('[cancel] Supabase update error:', updateError.message);
    return NextResponse.json(
      { message: 'Erro ao atualizar o pedido. Tente novamente.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: 'Pedido cancelado com sucesso.' }, { status: 200 });
}