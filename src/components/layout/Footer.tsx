'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook, Clock } from 'lucide-react';
import { useState } from 'react';

export function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
    alert('Cadastro realizado com sucesso!');
  };

  return (
    <footer className="bg-[#1a1a1a] mt-6">

      {/* ===== NEWSLETTER ===== */}
      <div className="border-b border-white/10 py-10">
        <div className="container-custom text-center">
          <h3 className="font-display font-700 text-white text-2xl mb-2">
            Cadastre-se e receba ofertas exclusivas
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Fique por dentro das melhores promoções da Tecnoiso
          </p>
          <form onSubmit={handleNewsletter} className="flex justify-center gap-0 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              required
              className="flex-1 px-4 py-3 bg-white text-gray-900 text-sm rounded-l-lg outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#00a650] hover:bg-[#009045] text-white font-700 text-sm rounded-r-lg transition-colors"
            >
              Cadastro
            </button>
          </form>
        </div>
      </div>

      {/* ===== LINKS ===== */}
      <div className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand */}
            <div>
              <Image
                src="/logotecnoiso.png"
                alt="Tecnoiso"
                width={130}
                height={40}
                className="object-contain mb-4"
              />
              <p className="text-gray-400 text-sm leading-relaxed">
                Especialistas em instrumentos de medição e medição há mais de 20 anos. Produtos de qualidade com garantia e certificação.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#00a650] flex items-center justify-center transition-colors">
                  <Facebook className="w-4 h-4 text-white" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#00a650] flex items-center justify-center transition-colors">
                  <Instagram className="w-4 h-4 text-white" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#00a650] flex items-center justify-center transition-colors">
                  <Linkedin className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>

            {/* Links Rápidos */}
            <div>
              <h4 className="font-display font-700 text-white mb-5">Links Rápidos</h4>
              <ul className="space-y-3">
                {[
                  { href: '/products',        label: 'Todos os Produtos' },
                  { href: '/products?offer=true', label: 'Ofertas e Promoções' },
                  { href: '/products',        label: 'Categorias' },
                  { href: '/about',           label: 'Sobre a Tecnoiso' },
                  { href: '/contact',         label: 'Fale Conosco' },
                ].map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categorias */}
            <div>
              <h4 className="font-display font-700 text-white mb-5">Categorias</h4>
              <ul className="space-y-3">
                {[
                  { href: '/products?category=manometros',   label: 'Manômetros' },
                  { href: '/products?category=termometros',  label: 'Termômetros' },
                  { href: '/products?category=epis',         label: 'Balanças' },
                  { href: '/products?category=calibradores', label: 'Paquímetros e Micrômetros' },
                  { href: '/products?category=analisadores', label: 'Multímetros' },
                ].map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 className="font-display font-700 text-white mb-5">Contato</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-gray-400">
                  <MapPin className="w-4 h-4 text-[#00a650] shrink-0 mt-0.5" />
                  R. Dona Emma, 1541 - Floresta<br />Joinville - SC, 89211-493
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Phone className="w-4 h-4 text-[#00a650] shrink-0" />
                  (47) 3438-3175
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Mail className="w-4 h-4 text-[#00a650] shrink-0" />
                  contato@tecnoiso.com.br
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Clock className="w-4 h-4 text-[#00a650] shrink-0" />
                  Seg-Sex: 07:42 - 17:30
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ===== BARRA INFERIOR ===== */}
      <div className="border-t border-white/10 py-4">
        <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h16v4H4zm0 6h4v10H4zm6 0h4v10h-4zm6 0h4v10h-4z"/>
              </svg>
              PIX
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <path d="M2 10h20"/>
              </svg>
              Cartão de Crédito
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Compra Segura
            </span>
            <span className="px-3 py-1 bg-[#009ee3] text-white text-xs font-700 rounded">
              Mercado Pago
            </span>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Tecnoiso. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
