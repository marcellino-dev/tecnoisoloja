import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { mpPayment } from '@/lib/mercadopago';
import { sendOrderConfirmationEmail } from '@/lib/email';

// Mapeamento de status do Mercado Pago para status interno
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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  // O MP envia dois formatos: notificacoes IPN e webhooks. Tratamos os dois.
  const paymentId = body?.data?.id || body?.id;
  const topic     = body?.type   || body?.topic;

  if (!paymentId || topic !== 'payment') {
    return NextResponse.json({ ok: true });
  }

  try {
    // Busca os detalhes do pagamento na API do MP
    const payment = await mpPayment.get({ id: String(paymentId) });

    const mpStatus      = payment.status as string;
    const orderId       = payment.external_reference as string;
    const paymentMethod = payment.payment_type_id   as string;
    const newStatus     = STATUS_MAP[mpStatus] || 'pending';

    if (!orderId) {
      console.warn('[webhook] external_reference ausente no pagamento', paymentId);
      return NextResponse.json({ ok: true });
    }

    const supabase = createAdminClient();

    // Busca o pedido atual para nao regredir status ja confirmado
    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(name, price))')
      .eq('id', orderId)
      .single();

    if (!order) {
      console.warn('[webhook] Pedido nao encontrado:', orderId);
      return NextResponse.json({ ok: true });
    }

    // Nao regride status: se ja esta paid, nao volta para pending
    const STATUS_RANK: Record<string, number> = {
      pending: 0, cancelled: 1, refunded: 1, paid: 2, shipped: 3, delivered: 4,
    };
    if ((STATUS_RANK[newStatus] || 0) <= (STATUS_RANK[order.status] || 0) && order.status !== 'pending') {
      return NextResponse.json({ ok: true });
    }

    // Atualiza o pedido com status e dados do pagamento
    await supabase
      .from('orders')
      .update({
        status:            newStatus,
        mp_payment_id:     String(paymentId),
        mp_payment_method: paymentMethod,
        mp_payment_status: mpStatus,
      })
      .eq('id', orderId);

    // Se pagamento aprovado: baixa estoque e envia email
    if (newStatus === 'paid') {
      // Baixa estoque de cada item
      for (const item of order.order_items || []) {
        await supabase.rpc('decrement_stock', {
          p_product_id: item.product_id,
          p_quantity:   item.quantity,
        });
      }

      // Busca email do usuario
      const { data: user } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', order.user_id)
        .single();

      if (user?.email) {
        await sendOrderConfirmationEmail({
          to:            user.email,
          customerName:  user.name,
          orderId:       order.id,
          total:         order.total,
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
    console.error('[webhook] Erro ao processar pagamento MP:', err);
  }

  // Sempre retorna 200 para o MP nao retentar
  return NextResponse.json({ ok: true });
}
