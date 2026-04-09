import { createAdminClient } from '@/lib/supabase/server';
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';
import { TrendingUp, ShoppingBag, Users, Package, Clock } from 'lucide-react';
import Link from 'next/link';

async function getMetrics() {
  const supabase = createAdminClient();
  const [orders, users, products, recentOrders] = await Promise.all([
    supabase.from('orders').select('id, total, status', { count: 'exact' }),
    supabase.from('users').select('id', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact' }),
    supabase.from('orders')
      .select('*, user:users(name, email)')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const allOrders     = orders.data || [];
  const paidOrders    = allOrders.filter(o => o.status === 'paid');
  const pendingOrders = allOrders.filter(o => o.status === 'pending');
  const totalRevenue  = paidOrders.reduce((acc, o) => acc + Number(o.total), 0);

  return {
    total_revenue:  totalRevenue,
    total_orders:   orders.count   || 0,
    pending_orders: pendingOrders.length,
    total_users:    users.count    || 0,
    total_products: products.count || 0,
    recent_orders:  recentOrders.data || [],
  };
}

export default async function AdminDashboardPage() {
  const metrics = await getMetrics();

  const STATS = [
    { label: 'Faturamento Total', value: formatPrice(metrics.total_revenue), icon: TrendingUp, color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  icon_bg: 'bg-green-100' },
    { label: 'Pedidos Totais',    value: metrics.total_orders,               icon: ShoppingBag, color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon_bg: 'bg-blue-100' },
    { label: 'Aguardando',        value: metrics.pending_orders,             icon: Clock,       color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon_bg: 'bg-yellow-100' },
    { label: 'Usuários',          value: metrics.total_users,                icon: Users,       color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon_bg: 'bg-purple-100' },
    { label: 'Produtos Ativos',   value: metrics.total_products,             icon: Package,     color: 'text-brand-600',  bg: 'bg-brand-50',  border: 'border-brand-200',  icon_bg: 'bg-brand-100' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-800 text-2xl text-gray-900">Painel</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral da loja</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {STATS.map(stat => (
          <div key={stat.label} className={`rounded-2xl border p-5 ${stat.bg} ${stat.border}`}>
            <div className={`w-10 h-10 rounded-xl ${stat.icon_bg} flex items-center justify-center mb-4`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className={`font-display font-800 text-2xl ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1 font-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-display font-700 text-gray-900">Pedidos Recentes</h2>
          <Link href="/admin/orders" className="text-xs text-brand-600 hover:text-brand-700 font-600 transition-colors">
            Ver todos →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs font-600 uppercase tracking-wider">
                <th className="text-left px-6 py-3">Pedido</th>
                <th className="text-left px-6 py-3">Cliente</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-right px-6 py-3">Total</th>
                <th className="text-right px-6 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recent_orders.map((order: any) => {
                const s = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'text-gray-500 bg-gray-100' };
                return (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-900 font-600">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4 text-gray-600">{order.user?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-600 ${s.color}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-display font-700 text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4 text-right text-gray-400">{formatDate(order.created_at)}</td>
                  </tr>
                );
              })}
              {metrics.recent_orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">Nenhum pedido ainda</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
