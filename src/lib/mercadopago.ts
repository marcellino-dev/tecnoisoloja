import MercadoPagoConfig, { Payment, Preference } from 'mercadopago';

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error('MP_ACCESS_TOKEN não configurado');
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 10000 },
});

export const mpPayment   = new Payment(client);
export const mpPreference = new Preference(client);
