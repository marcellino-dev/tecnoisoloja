import MercadoPagoConfig, { Payment, Preference } from 'mercadopago';

const accessToken = process.env.MP_ACCESS_TOKEN ?? '';

const client = new MercadoPagoConfig({
  accessToken,
  options: { timeout: 10000 },
});

export const mpPayment    = new Payment(client);
export const mpPreference = new Preference(client);