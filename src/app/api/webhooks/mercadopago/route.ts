// src/app/api/webhooks/mercadopago/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { mpPayment } from '@/lib/mercadopago';
import { sendOrderConfirmationEmail } from '@/lib/email';

// Mapeamento de status do Mercado Pago → status interno
// delivered NÃO vem do MP — é setado pelo admin/logística separadamente
const STATUS_MAP: Record<string, string> = {
  approved:     'paid',
  pending:      'pending',
  in_process:   'pending',
  in_mediation: 'pending',
  rejected:     'cancelled',
  cancelled:    'cancelled',
  refunded:     'refunded',
  charged_back: 'refunded',
};

// Hierarquia de status: nunca regride para um status inferior
// delivered é o topo — só o admin pode setar
const STATUS_RANK: Record<string, number> = {
  pending:    0,
  cancelled:  1,
  refunded:   1,
  paid:       2,
  processing: 3,
  shipped:    4,
  delivered:  5, // topo — webhook nunca sobrescreve
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const paymentId = body?.data?.id || body?.id;
  const topic     = body?.type   || body?.topic;

  // Ignora notificações que não são de pagamento
  if (!paymentId || topic !== 'payment') {
    return NextResponse.json({ ok: true });
  }

  try {
    const payment = await mpPayment.get({ id: String(paymentId) });

    const mpStatus      = payment.status as string;
    const orderId       = payment.external_reference as string;
    const paymentMethod = payment.payment_type_id as string;
    const newStatus     = STATUS_MAP[mpStatus] || 'pending';

    if (!orderId) {
      console.warn('[webhook/mp] external_reference ausente:', paymentId);
      return NextResponse.json({ ok: true });
    }

    const supabase = createAdminClient();

    const { data: order } = await supabase
      .from('orders')
      .select('id, status, user_id, total, order_items(product_id, product_name, product_price, quantity)')
      .eq('id', orderId)
      .single();

    if (!order) {
      console.warn('[webhook/mp] Pedido não encontrado:', orderId);
      return NextResponse.json({ ok: true });
    }

    // Nunca regride status — especialmente nunca sobrescreve `delivered`
    const currentRank = STATUS_RANK[order.status] ?? 0;
    const newRank     = STATUS_RANK[newStatus]    ?? 0;

    if (newRank <= currentRank && order.status !== 'pending') {
      console.info(`[webhook/mp] Status não regredido: ${order.status} → ${newStatus}`);
      return NextResponse.json({ ok: true });
    }

    // Atualiza o pedido
    await supabase
      .from('orders')
      .update({
        status:            newStatus,
        mp_payment_id:     String(paymentId),
        mp_payment_method: paymentMethod,
        mp_payment_status: mpStatus,
        updated_at:        new Date().toISOString(),
      })
      .eq('id', orderId);

    // Ações pós-pagamento aprovado
    if (newStatus === 'paid' && order.status === 'pending') {
      // Baixa estoque
      for (const item of order.order_items || []) {
        await supabase.rpc('decrement_stock', {
          p_product_id: item.product_id,
          p_quantity:   item.quantity,
        });
      }

      // Envia email de confirmação
      const { data: user } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', order.user_id)
        .single();

      if (user?.email) {
        await sendOrderConfirmationEmail({
          to:           user.email,
          customerName: user.name,
          orderId:      order.id,
          total:        order.total,
          paymentMethod,
          items: (order.order_items || []).map((i: any) => ({
            name:     i.product_name,
            quantity: i.quantity,
            price:    i.product_price,
          })),
        });
      }
    }

  } catch (err) {
    console.error('[webhook/mp] Erro:', err);
  }

  // Sempre 200 — o MP não retenta se receber 200
  return NextResponse.json({ ok: true });
}