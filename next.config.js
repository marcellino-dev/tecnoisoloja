/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.mercadopago.com https://*.mercadolibre.com https://*.mercadopago.com.br",
              "frame-src 'self' https://*.mercadopago.com https://*.mercadolibre.com https://*.mercadopago.com.br",
              "connect-src 'self' https://*.mercadopago.com https://*.mercadolibre.com https://*.mercadopago.com.br",
              "img-src 'self' data: https://*.mercadopago.com https://*.mercadolibre.com",
              "style-src 'self' 'unsafe-inline'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;