// app/(store)/orders/page.tsx
//
// Regras de negócio:
//   - "Total gasto"   → paid | shipped | delivered (MP confirmou o pagamento)
//   - "Em andamento"  → paid | processing | shipped
//   - Cancelamento    → só nas primeiras 24h + modal de confirmação → POST /api/orders/[id]/cancel
//   - Após 24h        → botão "Acionar Suporte" (link /contact)
//   - Status          → lidos do banco conforme webhook do Mercado Pago, nunca forçados aqui

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';
import {
  Package, Clock, CheckCircle2, Truck,
  ShoppingBag, TrendingUp, ReceiptText, Zap, HeadphonesIcon,
} from 'lucide-react';
import Link from 'next/link';
import { CancelButton } from './CancelButton';

export const metadata = { title: 'Meus Pedidos | Tecnoiso' };

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface OrderItem {
  product_name: string;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  tracking_code?: string | null;
  pagseguro_link?: string | null;
  payment_url?: string | null;
  mp_preference_id?: string | null;
  items: OrderItem[];
}

// ─── Regras de negócio ───────────────────────────────────────────────────────

// "Total gasto" = qualquer status onde o MP já confirmou o pagamento
// paid     → MP aprovou, aguardando envio
// shipped  → já enviado (pagamento confirmado)
// delivered → entregue ao cliente (pagamento confirmado)
const CONFIRMED_PAYMENT_STATUSES = new Set(['paid', 'processing', 'shipped', 'delivered']);

// Pedidos ativos (visíveis no contador "Em andamento")
const IN_PROGRESS_STATUSES = new Set(['paid', 'processing', 'shipped']);

// Statuses negativos — layout diferente, valores riscados
const NEGATIVE_STATUSES = new Set(['cancelled', 'refunded']);

// Janela de cancelamento: 24 horas em ms
const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

function withinCancelWindow(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < CANCEL_WINDOW_MS;
}

// ─── Visual por status ───────────────────────────────────────────────────────

const STATUS_VISUAL: Record<string, {
  color: string; bg: string; border: string; dot: string; timelineStep: number;
}> = {
  pending:    { color: '#92600a', bg: '#fff8e6', border: '#fde68a', dot: '#f59e0b', timelineStep: 0 },
  paid:       { color: '#065f46', bg: '#ecfdf5', border: '#a7f3d0', dot: '#10b981', timelineStep: 1 },
  processing: { color: '#5b21b6', bg: '#f5f3ff', border: '#ddd6fe', dot: '#7c3aed', timelineStep: 2 },
  shipped:    { color: '#1e3a8a', bg: '#eff6ff', border: '#bfdbfe', dot: '#3b82f6', timelineStep: 3 },
  delivered:  { color: '#14532d', bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e', timelineStep: 4 },
  cancelled:  { color: '#7f1d1d', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444', timelineStep: -1 },
  refunded:   { color: '#374151', bg: '#f9fafb', border: '#e5e7eb', dot: '#9ca3af', timelineStep: -1 },
};

const TIMELINE_STEPS = ['Pedido', 'Confirmado', 'Preparando', 'Em trânsito', 'Entregue'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shortId(id: string) {
  return `#TEC-${id.slice(0, 8).toUpperCase()}`;
}

function StatusBadge({ status }: { status: string }) {
  const visual = STATUS_VISUAL[status] ?? STATUS_VISUAL['pending'];
  const label  = (ORDER_STATUS_LABELS as any)[status]?.label ?? status;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 6,
      background: visual.bg, border: `1px solid ${visual.border}`, color: visual.color,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: visual.dot, flexShrink: 0, display: 'inline-block',
      }} />
      {label}
    </span>
  );
}

function Timeline({ status }: { status: string }) {
  const visual = STATUS_VISUAL[status];
  if (!visual || visual.timelineStep < 0) return null;
  const active = visual.timelineStep;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', margin: '14px 0 6px' }}>
      {TIMELINE_STEPS.map((step, i) => {
        const done    = i < active;
        const current = i === active;
        return (
          <div key={step} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', position: 'relative',
          }}>
            {i < TIMELINE_STEPS.length - 1 && (
              <div style={{
                position: 'absolute', top: 9, left: '50%', right: '-50%',
                height: 2, background: done ? '#22c55e' : '#e5e7eb', zIndex: 0,
              }} />
            )}
            <div style={{
              width: 20, height: 20, borderRadius: '50%', zIndex: 1, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: done ? '#22c55e' : current ? visual.dot : '#fff',
              border: `2px solid ${done ? '#22c55e' : current ? visual.dot : '#e5e7eb'}`,
            }}>
              {done && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <polyline points="2,5 4.5,7.5 8,2.5" stroke="#fff" strokeWidth="1.6"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{
              fontSize: 10, marginTop: 5, textAlign: 'center',
              fontWeight: 600, lineHeight: 1.2,
              color: done ? '#16a34a' : current ? visual.color : '#9ca3af',
            }}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const visual      = STATUS_VISUAL[order.status] ?? STATUS_VISUAL['pending'];
  const isNegative  = NEGATIVE_STATUSES.has(order.status);
  const isPending   = order.status === 'pending';
  const isShipped   = order.status === 'shipped';
  const isDelivered = order.status === 'delivered';
  const canCancel   = isPending && withinCancelWindow(order.created_at);
  const needSupport = isPending && !withinCancelWindow(order.created_at);

  // Link de pagamento: suporta MP preference id, payment_url e legado PagSeguro
  const paymentLink = order.payment_url
    ?? (order.mp_preference_id
        ? `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${order.mp_preference_id}`
        : null)
    ?? order.pagseguro_link;

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${isNegative ? '#fecaca' : '#e5e7eb'}`,
      borderRadius: 12, overflow: 'hidden',
    }}>
      {/* Cabeçalho */}
      <div style={{
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        borderBottom: '1px solid #f3f4f6',
        background: isNegative ? '#fef2f2' : '#fafafa',
      }}>
        <div>
          <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
            Pedido
          </p>
          <p style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#111', margin: '2px 0 0' }}>
            {shortId(order.id)}
          </p>
        </div>

        <StatusBadge status={order.status} />

        {order.tracking_code && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a',
            borderRadius: 6, fontSize: 11, fontWeight: 700,
            padding: '4px 10px', fontFamily: 'var(--font-mono)',
          }}>
            📦 {order.tracking_code}
          </span>
        )}

        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{formatDate(order.created_at)}</p>
          {canCancel && (
            <p style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600, margin: '2px 0 0' }}>
              Cancelamento disponível por 24h
            </p>
          )}
        </div>
      </div>

      {/* Timeline */}
      {!isNegative && (
        <div style={{ padding: '0 20px' }}>
          <Timeline status={order.status} />
        </div>
      )}

      {/* Itens */}
      {order.items?.length > 0 && (
        <div style={{ padding: '14px 20px', borderTop: isNegative ? 'none' : '1px solid #f3f4f6' }}>
          <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px' }}>
            Itens do pedido
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: isNegative ? 0.5 : 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                  background: '#f3f4f6', border: '1px solid #e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>
                  🔧
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 500, color: '#111', margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    textDecoration: isNegative ? 'line-through' : 'none',
                  }}>
                    {item.product_name}
                  </p>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
                    Quantidade: {item.quantity}
                  </p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', margin: 0 }}>
                  {formatPrice(item.subtotal)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rodapé */}
      <div style={{
        padding: '12px 20px', background: '#f9fafb',
        borderTop: '1px solid #f3f4f6',
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ marginRight: 'auto' }}>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Total do pedido</p>
          <p style={{
            fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)',
            color: isNegative ? '#9ca3af' : '#111', margin: '2px 0 0',
            letterSpacing: '-0.02em',
            textDecoration: isNegative ? 'line-through' : 'none',
          }}>
            <span style={{ color: isNegative ? '#9ca3af' : '#E63946', fontSize: 13, fontWeight: 600 }}>
              R${' '}
            </span>
            {formatPrice(order.total).replace(/^R\$\s*/, '')}
          </p>
        </div>

        {/* PENDING: pagar agora */}
        {isPending && paymentLink && (
          <a href={paymentLink} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 7,
            background: '#E63946', color: '#fff',
            fontSize: 12, fontWeight: 700, textDecoration: 'none',
          }}>
            <Zap style={{ width: 13, height: 13 }} />
            Pagar agora
          </a>
        )}

        {canCancel && <CancelButton orderId={order.id} shortId={shortId(order.id)} />}

        {needSupport && (
          <Link href="/contact" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 7,
            background: '#fff8e6', color: '#92600a',
            fontSize: 12, fontWeight: 600,
            border: '1px solid #fde68a', textDecoration: 'none',
          }}>
            <HeadphonesIcon style={{ width: 13, height: 13 }} />
            Acionar Suporte
          </Link>
        )}

        {isShipped && (
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 7,
            background: '#eff6ff', color: '#1e3a8a',
            fontSize: 12, fontWeight: 600,
            border: '1px solid #bfdbfe', cursor: 'pointer',
          }}>
            <Truck style={{ width: 13, height: 13 }} />
            Rastrear pedido
          </button>
        )}

        {isDelivered && (
          <>
            <Link href="/products" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 7,
              background: '#E63946', color: '#fff',
              fontSize: 12, fontWeight: 700, textDecoration: 'none',
            }}>
              <ShoppingBag style={{ width: 13, height: 13 }} />
              Comprar novamente
            </Link>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 7,
              background: '#fff', color: '#374151',
              fontSize: 12, fontWeight: 600,
              border: '1px solid #e5e7eb', cursor: 'pointer',
            }}>
              <ReceiptText style={{ width: 13, height: 13 }} />
              Ver NF-e
            </button>
          </>
        )}

        {isNegative && (
          <Link href="/products" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 7,
            background: '#0a0a0a', color: '#fff',
            fontSize: 12, fontWeight: 700, textDecoration: 'none',
          }}>
            <ShoppingBag style={{ width: 13, height: 13 }} />
            Pedir novamente
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Página principal (Server Component) ─────────────────────────────────────

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const supabase = createAdminClient();
  const userId   = (session.user as any).id;

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, items:order_items(product_name, quantity, subtotal)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) console.error('[OrdersPage] Supabase error:', error.message);

  const list = (orders ?? []) as Order[];

  // ── Estatísticas ──────────────────────────────────────────────────────────

  const totalOrders = list.length;

  // "Total gasto" = apenas pedidos com pagamento CONFIRMADO pelo MP
  // Inclui paid, processing, shipped e delivered — todos tiveram o pagamento aprovado
  // Exclui: pending (ainda não pago), cancelled e refunded (dinheiro devolvido)
  const totalSpent = list
    .filter((o) => CONFIRMED_PAYMENT_STATUSES.has(o.status))
    .reduce((acc, o) => acc + (o.total ?? 0), 0);

  // "Em andamento" = pagos e ainda não entregues
  const inProgress = list.filter((o) => IN_PROGRESS_STATUSES.has(o.status)).length;

  // "Aguardando pagamento" = pending
  const pending = list.filter((o) => o.status === 'pending').length;

  // "Entregues" = delivered
  const delivered = list.filter((o) => o.status === 'delivered').length;

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: 64 }}>
      <div className="container-custom" style={{ paddingTop: 40 }}>

        {/* Cabeçalho */}
        <div style={{
          paddingBottom: 20, borderBottom: '1px solid #e5e7eb', marginBottom: 28,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#E63946',
              fontFamily: 'var(--font-mono)', margin: '0 0 6px',
            }}>
              Minha conta
            </p>
            <h1 style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#111',
              letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-display)',
            }}>
              Meus Pedidos
            </h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '6px 0 0' }}>
              Histórico completo de compras e acompanhamento de entregas
            </p>
          </div>
          <Link href="/products" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 8,
            background: '#0a0a0a', color: '#fff',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}>
            <ShoppingBag style={{ width: 15, height: 15 }} />
            Continuar comprando
          </Link>
        </div>

        {/* Cards de estatísticas */}
        {totalOrders > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12, marginBottom: 28,
          }}>
            {([
              {
                label: 'Total de pedidos',
                value: totalOrders,
                sub: 'histórico completo',
                icon: Package,
                color: '#111',
              },
              {
                label: 'Aguardando pag.',
                value: pending,
                sub: pending > 0 ? '⚠ ação necessária' : 'nenhum pendente',
                icon: Clock,
                color: pending > 0 ? '#f59e0b' : '#9ca3af',
              },
              {
                label: 'Em andamento',
                value: inProgress,
                sub: 'pagos e a caminho',
                icon: Truck,
                color: inProgress > 0 ? '#3b82f6' : '#9ca3af',
              },
              {
                label: 'Entregues',
                value: delivered,
                sub: 'com sucesso',
                icon: CheckCircle2,
                color: delivered > 0 ? '#22c55e' : '#9ca3af',
              },
              {
                // paid + processing + shipped + delivered = pagamento confirmado pelo MP
                label: 'Total gasto',
                value: formatPrice(totalSpent),
                sub: 'pagamento confirmado MP',
                icon: TrendingUp,
                color: totalSpent > 0 ? '#E63946' : '#9ca3af',
              },
            ] as const).map((stat) => (
              <div key={stat.label} style={{
                background: '#fff', border: '1px solid #e5e7eb',
                borderRadius: 10, padding: '16px 18px',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginBottom: 8,
                }}>
                  <p style={{
                    fontSize: 11, fontWeight: 600, color: '#9ca3af',
                    letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0,
                  }}>
                    {stat.label}
                  </p>
                  <stat.icon style={{ width: 15, height: 15, color: stat.color, flexShrink: 0 }} />
                </div>
                <p style={{
                  fontSize: typeof stat.value === 'number' ? 26 : 18,
                  fontWeight: 800, color: stat.color, margin: 0,
                  letterSpacing: '-0.03em', fontFamily: 'var(--font-mono)',
                }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Estado vazio */}
        {list.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: '#f3f4f6', border: '1px solid #e5e7eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Package style={{ width: 30, height: 30, color: '#9ca3af' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', fontFamily: 'var(--font-display)', margin: '0 0 8px' }}>
              Nenhum pedido ainda
            </h2>
            <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 28px' }}>
              Você ainda não realizou nenhuma compra. Explore nosso catálogo!
            </p>
            <Link href="/products" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 8,
              background: '#E63946', color: '#fff',
              fontSize: 14, fontWeight: 700, textDecoration: 'none',
            }}>
              <ShoppingBag style={{ width: 16, height: 16 }} />
              Explorar Produtos
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {list.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}