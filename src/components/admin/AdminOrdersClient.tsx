'use client';

import { useState } from 'react';
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';
import { Order } from '@/types';
import { ChevronDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;

export function AdminOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar');
      setOrders(os => os.map(o => o.id === id ? { ...o, status: status as any } : o));
      toast.success('Status atualizado!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-800 text-2xl text-white">Pedidos</h1>
        <p className="text-dark-400 text-sm mt-1">{orders.length} pedido{orders.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700 text-dark-500 text-xs font-mono uppercase tracking-wider">
                <th className="text-left px-4 py-3">Pedido</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Cliente</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Itens</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-right px-4 py-3 hidden md:table-cell">Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const s = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'text-dark-400 bg-dark-700' };
                const items = (order as any).items || [];
                return (
                  <tr key={order.id} className="border-b border-dark-800 hover:bg-dark-700/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-white">
                      {order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-dark-200">{(order as any).user?.name || '—'}</div>
                      <div className="text-xs text-dark-500">{(order as any).user?.email}</div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-dark-400 text-xs max-w-[200px]">
                      {items.slice(0, 2).map((i: any, idx: number) => (
                        <div key={idx}>{i.product_name} ×{i.quantity}</div>
                      ))}
                      {items.length > 2 && <div className="text-dark-600">+{items.length - 2} mais</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-flex items-center gap-1">
                        {updating === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                        ) : (
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={e => updateStatus(order.id, e.target.value)}
                              className={`badge ${s.color} appearance-none cursor-pointer pr-6 bg-transparent border-0 focus:outline-none`}
                            >
                              {STATUSES.map(st => {
                                const sl = ORDER_STATUS_LABELS[st];
                                return <option key={st} value={st}>{sl?.label || st}</option>;
                              })}
                            </select>
                            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-display font-700 text-white">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-right text-dark-400 hidden md:table-cell">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-dark-500">
                    Nenhum pedido ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
