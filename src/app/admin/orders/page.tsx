import { createAdminClient } from '@/lib/supabase/server';
import { AdminOrdersClient } from '@/components/admin/AdminOrdersClient';

export const metadata = { title: 'Pedidos | Admin' };

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('*, user:users(name, email), items:order_items(product_name, quantity, subtotal)')
    .order('created_at', { ascending: false });

  return <AdminOrdersClient initialOrders={orders || []} />;
}
