'use client';

import { useState } from 'react';
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';
import { Order } from '@/types';
import { ChevronDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;

const STATUS_STYLES: Record<string, string> = {
  pending:   'color: #d97706; background: #fffbeb; border: 1px solid #fde68a;',
  paid:      'color: #059669; background: #f0fdf4; border: 1px solid #a7f3d0;',
  shipped:   'color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe;',
  delivered: 'color: #7c3aed; background: #f5f3ff; border: 1px solid #ddd6fe;',
  cancelled: 'color: #dc2626; background: #fef2f2; border: 1px solid #fecaca;',
};

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: '#111', margin: 0 }}>
          Pedidos
        </h1>
        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
          {orders.length} pedido{orders.length !== 1 ? 's' : ''} no total
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                {['Pedido', 'Cliente', 'Itens', 'Status', 'Total', 'Data'].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      textAlign: i >= 4 ? 'right' : 'left',
                      padding: '12px 20px',
                      color: '#9ca3af',
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                    className={i === 1 ? 'hidden md:table-cell' : i === 2 ? 'hidden lg:table-cell' : i === 5 ? 'hidden md:table-cell' : ''}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const s = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: '' };
                const items = (order as any).items || [];
                const statusStyle = STATUS_STYLES[order.status] || '';

                return (
                  <tr
                    key={order.id}
                    style={{ borderBottom: '1px solid #f9fafb', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fafafa'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontWeight: 700,
                        fontSize: 12, color: '#0a0a0a',
                        background: '#f3f4f6', padding: '3px 8px', borderRadius: 4,
                      }}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="hidden md:table-cell" style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#111', fontSize: 13 }}>{(order as any).user?.name || '—'}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{(order as any).user?.email}</div>
                    </td>
                    <td className="hidden lg:table-cell" style={{ padding: '14px 20px', maxWidth: 200 }}>
                      {items.slice(0, 2).map((i: any, idx: number) => (
                        <div key={idx} style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
                          {i.product_name} <span style={{ color: '#9ca3af' }}>×{i.quantity}</span>
                        </div>
                      ))}
                      {items.length > 2 && (
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>+{items.length - 2} mais</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {updating === order.id ? (
                        <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite', color: '#E63946' }} />
                      ) : (
                        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                          <select
                            value={order.status}
                            onChange={e => updateStatus(order.id, e.target.value)}
                            style={{
                              appearance: 'none',
                              cursor: 'pointer',
                              paddingRight: 24, paddingLeft: 10,
                              paddingTop: 5, paddingBottom: 5,
                              borderRadius: 99,
                              fontSize: 11, fontWeight: 700,
                              outline: 'none', border: 'none',
                              ...(order.status === 'pending' ? { color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a' } : {}),
                              ...(order.status === 'paid' ? { color: '#059669', background: '#f0fdf4', border: '1px solid #a7f3d0' } : {}),
                              ...(order.status === 'shipped' ? { color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe' } : {}),
                              ...(order.status === 'delivered' ? { color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe' } : {}),
                              ...(order.status === 'cancelled' ? { color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' } : {}),
                            }}
                          >
                            {STATUSES.map(st => {
                              const sl = ORDER_STATUS_LABELS[st];
                              return <option key={st} value={st}>{sl?.label || st}</option>;
                            })}
                          </select>
                          <ChevronDown style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, pointerEvents: 'none', opacity: 0.5 }} />
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#111', fontSize: 14 }}>
                        {formatPrice(order.total)}
                      </span>
                    </td>
                    <td className="hidden md:table-cell" style={{ padding: '14px 20px', textAlign: 'right', color: '#9ca3af', fontSize: 12 }}>
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: 14 }}>
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