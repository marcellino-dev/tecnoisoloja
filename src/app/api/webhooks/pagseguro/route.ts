import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const STATUS_MAP: Record<string, string> = {
  '1': 'pending',    // Aguardando pagamento
  '2': 'pending',    // Em análise
  '3': 'paid',       // Pago
  '4': 'paid',       // Disponível
  '5': 'pending',    // Em disputa
  '6': 'cancelled',  // Devolvido
  '7': 'cancelled',  // Cancelado
  '8': 'cancelled',  // Debitado
  '9': 'cancelled',  // Retenção temporária
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);
  const notificationCode = params.get('notificationCode');
  const notificationType = params.get('notificationType');

  if (notificationType !== 'transaction' || !notificationCode) {
    return NextResponse.json({ ok: true });
  }

  try {
    const baseUrl = process.env.PAGSEGURO_URL || 'https://sandbox.pagseguro.uol.com.br';
    const txRes   = await fetch(
      `${baseUrl}/v3/transactions/notifications/${notificationCode}?email=${process.env.PAGSEGURO_EMAIL}&token=${process.env.PAGSEGURO_TOKEN}`
    );
    const xml     = await txRes.text();
    const status  = xml.match(/<status>(\d+)<\/status>/)?.[1];
    const orderId = xml.match(/<reference>(.+?)<\/reference>/)?.[1];

    if (status && orderId) {
      const newStatus = STATUS_MAP[status] || 'pending';
      const supabase  = createAdminClient();
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    }
  } catch (err) {
    console.error('Webhook PagSeguro error:', err);
  }

  return NextResponse.json({ ok: true });
}
