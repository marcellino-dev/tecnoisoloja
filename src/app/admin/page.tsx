import { createAdminClient } from '@/lib/supabase/server';
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';
import { TrendingUp, ShoppingBag, Users, Package, Clock } from 'lucide-react';

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

  const allOrders    = orders.data || [];
  const paidOrders   = allOrders.filter(o => o.status === 'paid');
  const pendingOrders = allOrders.filter(o => o.status === 'pending');
  const totalRevenue = paidOrders.reduce((acc, o) => acc + Number(o.total), 0);

  return {
    total_revenue:  totalRevenue,
    total_orders:   orders.count  || 0,
    pending_orders: pendingOrders.length,
    total_users:    users.count   || 0,
    total_products: products.count || 0,
    recent_orders:  recentOrders.data || [],
  };
}

export default async function AdminDashboardPage() {
  const metrics = await getMetrics();

  const STATS = [
    { label: 'Faturamento Total', value: formatPrice(metrics.total_revenue), icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
    { label: 'Pedidos Totais',    value: metrics.total_orders,               icon: ShoppingBag, color: 'text-blue-400',  bg: 'bg-blue-400/10 border-blue-400/20' },
    { label: 'Aguardando',        value: metrics.pending_orders,             icon: Clock,       color: 'text-yellow-400',bg: 'bg-yellow-400/10 border-yellow-400/20' },
    { label: 'Usuários',          value: metrics.total_users,                icon: Users,       color: 'text-purple-400',bg: 'bg-purple-400/10 border-purple-400/20' },
    { label: 'Produtos Ativos',   value: metrics.total_products,             icon: Package,     color: 'text-brand-400', bg: 'bg-brand-400/10 border-brand-400/20' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-800 text-2xl text-white">Dashboard</h1>
        <p className="text-dark-400 text-sm mt-1">Visão geral da loja</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {STATS.map(stat => (
          <div key={stat.label} className={`card p-5 border ${stat.bg}`}>
            <div className={`w-9 h-9 rounded-lg ${stat.bg} border flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className={`font-display font-800 text-2xl ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-dark-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-700 flex items-center justify-between">
          <h2 className="font-display font-700 text-white">Pedidos Recentes</h2>
          <a href="/admin/orders" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
            Ver todos →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700 text-dark-500 text-xs font-mono uppercase tracking-wider">
                <th className="text-left px-5 py-3">Pedido</th>
                <th className="text-left px-5 py-3">Cliente</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Total</th>
                <th className="text-right px-5 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recent_orders.map((order: any) => {
                const s = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'text-dark-400 bg-dark-700' };
                return (
                  <tr key={order.id} className="border-b border-dark-800 hover:bg-dark-700/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-white">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-5 py-3 text-dark-300">{order.user?.name || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-display font-700 text-white">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3 text-right text-dark-400">{formatDate(order.created_at)}</td>
                  </tr>
                );
              })}
              {metrics.recent_orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-dark-500">Nenhum pedido ainda</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
