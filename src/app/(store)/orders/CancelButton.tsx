'use client';

import { useState } from 'react';
import { XCircle } from 'lucide-react';

interface CancelButtonProps {
  orderId: string;
  shortId: string;
}

export function CancelButton({ orderId, shortId }: CancelButtonProps) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? 'Erro ao cancelar pedido.');
      }
      // Recarrega a página para refletir o novo status vindo do webhook
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <>
      {/* Botão que abre o modal */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 7,
          background: '#fef2f2', color: '#7f1d1d',
          fontSize: 12, fontWeight: 600,
          border: '1px solid #fecaca', cursor: 'pointer',
        }}
      >
        <XCircle style={{ width: 13, height: 13 }} />
        Cancelar pedido
      </button>

      {/* Modal de confirmação */}
      {open && (
        <div
          onClick={() => !loading && setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 14,
              padding: '28px 28px 24px',
              maxWidth: 420, width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            {/* Ícone */}
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: '#fef2f2', border: '1px solid #fecaca',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <XCircle style={{ width: 24, height: 24, color: '#ef4444' }} />
            </div>

            <h2 style={{
              fontSize: 17, fontWeight: 800, color: '#111',
              textAlign: 'center', margin: '0 0 8px',
            }}>
              Cancelar pedido {shortId}?
            </h2>
            <p style={{
              fontSize: 13, color: '#6b7280',
              textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5,
            }}>
              Essa ação não pode ser desfeita. O cancelamento será processado e
              o reembolso, quando aplicável, seguirá as políticas do Mercado Pago.
            </p>

            {error && (
              <p style={{
                fontSize: 12, color: '#ef4444', textAlign: 'center',
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 6, padding: '8px 12px', margin: '0 0 16px',
              }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 8,
                  background: '#f3f4f6', color: '#374151',
                  fontSize: 13, fontWeight: 600,
                  border: '1px solid #e5e7eb', cursor: 'pointer',
                }}
              >
                Voltar
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 8,
                  background: loading ? '#fca5a5' : '#ef4444', color: '#fff',
                  fontSize: 13, fontWeight: 700,
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Cancelando…' : 'Confirmar cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}