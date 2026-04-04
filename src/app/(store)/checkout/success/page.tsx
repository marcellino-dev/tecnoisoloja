import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Props {
  searchParams: { order?: string };
}

export default function CheckoutSuccessPage({ searchParams }: Props) {
  return (
    <div className="py-20">
      <div className="container-custom max-w-lg mx-auto text-center py-20">
        <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="font-display font-800 text-3xl text-white mb-3">Pedido realizado!</h1>
        <p className="text-dark-300 mb-2">
          Seu pedido foi registrado com sucesso e está sendo processado.
        </p>
        {searchParams.order && (
          <p className="text-xs font-mono text-dark-500 mb-8">
            Nº do pedido: <span className="text-brand-400">{searchParams.order}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/orders" className="btn-primary">Ver meus pedidos</Link>
          <Link href="/products" className="btn-secondary">Continuar comprando</Link>
        </div>
      </div>
    </div>
  );
}
