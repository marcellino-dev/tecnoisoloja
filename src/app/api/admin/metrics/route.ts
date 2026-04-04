import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createAdminClient } from '@/lib/supabase/server';

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
  const paidOrders   = allOrders.filter(o => o.status === 'paid');
  const pendingOrders = allOrders.filter(o => o.status === 'pending');
  const totalRevenue = paidOrders.reduce((acc, o) => acc + Number(o.total), 0);

  const recentOrders = await supabase
    .from('orders')
    .select('*, user:users(name,email)')
    .order('created_at', { ascending: false })
    .limit(5);

  return NextResponse.json({
    data: {
      total_revenue:   totalRevenue,
      total_orders:    orders.count || 0,
      pending_orders:  pendingOrders.length,
      total_users:     users.count  || 0,
      total_products:  products.count || 0,
      recent_orders:   recentOrders.data || [],
    },
  });
}
