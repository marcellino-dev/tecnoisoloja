import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';
import { Package } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Meus Pedidos' };

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const supabase = createAdminClient();
  const userId = (session.user as any).id;

  const { data: orders } = await supabase
    .from('orders')
    .select('*, items:order_items(product_name, quantity, subtotal)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return (
    <div className="py-10">
      <div className="container-custom">
        <h1 className="section-title mb-8">Meus Pedidos</h1>

        {!orders?.length ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-dark-600 mx-auto mb-4" />
            <h2 className="font-display font-700 text-white text-xl mb-2">Nenhum pedido ainda</h2>
            <p className="text-dark-400 mb-6">Você ainda não fez nenhum pedido.</p>
            <Link href="/products" className="btn-primary">Explorar Produtos</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const status = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'text-dark-400 bg-dark-700' };
              return (
                <div key={order.id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs font-mono text-dark-500">Pedido</p>
                      <p className="font-mono text-sm text-white">{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-dark-500 mb-1">Status</p>
                      <span className={`badge ${status.color} font-600`}>{status.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-dark-500">Total</p>
                      <p className="font-display font-800 text-white">{formatPrice(order.total)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-dark-500">Data</p>
                      <p className="text-sm text-dark-300">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  {order.items?.length > 0 && (
                    <div className="border-t border-dark-700 pt-3">
                      <p className="text-xs text-dark-500 mb-2">Itens:</p>
                      <ul className="space-y-1">
                        {order.items.map((item: any, i: number) => (
                          <li key={i} className="text-sm text-dark-400 flex justify-between">
                            <span>{item.product_name} ×{item.quantity}</span>
                            <span>{formatPrice(item.subtotal)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {order.pagseguro_link && order.status === 'pending' && (
                    <div className="mt-3 pt-3 border-t border-dark-700">
                      <a href={order.pagseguro_link} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-2">
                        Pagar agora →
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
