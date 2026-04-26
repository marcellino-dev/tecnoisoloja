import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailParams {
  to: string;
  customerName: string;
  orderId: string;
  total: number;
  paymentMethod: string;
  items: { name: string; quantity: number; price: number }[];
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function buildOrderEmailHtml(params: OrderEmailParams): string {
  const { customerName, orderId, total, paymentMethod, items } = params;

  const itemRows = items.map(item => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${item.name}</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">${formatCurrency(item.price)}</td>
    </tr>
  `).join('');

  const methodLabel: Record<string, string> = {
    credit_card: 'Cartao de Credito',
    pix:         'PIX',
    bolbradesco: 'Boleto Bancario',
    pec:         'Boleto Bancario',
  };

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8" /></head>
    <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: #1d4ed8; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Pedido Confirmado</h1>
      </div>
      <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e5e5;">
        <p>Ola, <strong>${customerName}</strong>.</p>
        <p>Recebemos seu pedido e ele esta sendo processado.</p>

        <div style="background: white; border-radius: 6px; padding: 16px; margin: 16px 0; border: 1px solid #e5e5e5;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">Numero do pedido</p>
          <p style="margin: 0; font-family: monospace; font-size: 14px; font-weight: bold;">${orderId}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background: #f0f0f0;">
              <th style="padding: 8px; text-align: left; font-size: 12px;">Produto</th>
              <th style="padding: 8px; text-align: center; font-size: 12px;">Qtd</th>
              <th style="padding: 8px; text-align: right; font-size: 12px;">Valor</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px 0 0 0; font-weight: bold;">Total</td>
              <td style="padding: 12px 0 0 0; text-align: right; font-weight: bold; font-size: 18px; color: #1d4ed8;">
                ${formatCurrency(total)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div style="background: #eff6ff; border-left: 4px solid #1d4ed8; padding: 12px 16px; border-radius: 4px; margin-top: 16px;">
          <p style="margin: 0; font-size: 13px;">
            <strong>Forma de pagamento:</strong> ${methodLabel[paymentMethod] || paymentMethod}
          </p>
        </div>

        <p style="margin-top: 24px; font-size: 13px; color: #666;">
          Acompanhe o status do seu pedido na sua conta. Em caso de duvidas, entre em contato com nosso suporte.
        </p>
      </div>
    </body>
    </html>
  `;
}

export async function sendOrderConfirmationEmail(params: OrderEmailParams) {
  const { error } = await resend.emails.send({
    from:    'Tecnoiso <pedidos@tecnoiso.com>',
    to:      params.to,
    subject: `Pedido confirmado #${params.orderId.slice(0, 8).toUpperCase()}`,
    html:    buildOrderEmailHtml(params),
  });

  if (error) {
    console.error('[email] Erro ao enviar confirmacao:', error);
  }
}
