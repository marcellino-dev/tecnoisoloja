// src/app/api/admin/metrics/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

// Statuses com pagamento confirmado pelo MP — contam no faturamento
const CONFIRMED_PAYMENT_STATUSES = new Set(['paid', 'processing', 'shipped', 'delivered']);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const [orders, users, products] = await Promise.all([
    supabase.from('orders').select('id, total, status, created_at', { count: 'exact' }),
    supabase.from('users').select('id', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact' }),
  ]);

  const allOrders = orders.data || [];

  // Faturamento real = qualquer pedido com pagamento confirmado pelo MP
  // (paid → aprovado | processing → em preparo | shipped → enviado | delivered → entregue)
  // Exclui: pending (não pago), cancelled e refunded (dinheiro devolvido)
  const totalRevenue = allOrders
    .filter((o: any) => CONFIRMED_PAYMENT_STATUSES.has(o.status))
    .reduce((acc: number, o: any) => acc + Number(o.total), 0);

  // Faturamento apenas de pedidos já entregues ao cliente
  const deliveredRevenue = allOrders
    .filter((o: any) => o.status === 'delivered')
    .reduce((acc: number, o: any) => acc + Number(o.total), 0);

  const pendingOrders   = allOrders.filter((o: any) => o.status === 'pending').length;
  const cancelledOrders = allOrders.filter((o: any) => o.status === 'cancelled').length;
  const deliveredOrders = allOrders.filter((o: any) => o.status === 'delivered').length;

  const recentOrders = await supabase
    .from('orders')
    .select('*, user:users(name,email)')
    .order('created_at', { ascending: false })
    .limit(5);

  return NextResponse.json({
    data: {
      // Faturamento confirmado (paid + processing + shipped + delivered)
      total_revenue:     totalRevenue,
      // Faturamento de pedidos já entregues ao cliente
      delivered_revenue: deliveredRevenue,
      // Contadores gerais
      total_orders:      orders.count || 0,
      pending_orders:    pendingOrders,
      cancelled_orders:  cancelledOrders,
      delivered_orders:  deliveredOrders,
      total_users:       users.count  || 0,
      total_products:    products.count || 0,
      recent_orders:     recentOrders.data || [],
    },
  });
}