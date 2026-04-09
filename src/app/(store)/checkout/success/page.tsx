import Link from 'next/link';

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  const orderId = searchParams.order;

  return (
    <div className="container-custom py-24 text-center max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 p-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display font-800 text-2xl text-gray-900 mb-2">Pedido confirmado</h1>
        <p className="text-gray-500 mb-2">
          Seu pagamento foi processado com sucesso.
        </p>
        {orderId && (
          <p className="text-xs font-mono text-gray-400 mb-6">
            #{orderId.slice(0, 8).toUpperCase()}
          </p>
        )}
        <p className="text-sm text-gray-500 mb-8">
          Voce recebera um email de confirmacao em breve com os detalhes do pedido.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/orders"
            className="px-6 py-3 bg-brand-600 text-white font-600 rounded-xl text-sm hover:bg-brand-500 transition-all">
            Ver meus pedidos
          </Link>
          <Link href="/products"
            className="px-6 py-3 bg-gray-100 text-gray-700 font-600 rounded-xl text-sm hover:bg-gray-200 transition-all">
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
