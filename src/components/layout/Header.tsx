'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useCartStore } from '@/lib/store/cart';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Search, MapPin, ChevronDown, Settings } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { label: 'Termometros',  slug: 'termometros' },
  { label: 'Manometros',   slug: 'manometros' },
  { label: 'Analisadores', slug: 'analisadores' },
  { label: 'Calibradores', slug: 'calibradores' },
  { label: 'Dataloggers',  slug: 'dataloggers' },
  { label: 'EPIs',         slug: 'epis' },
];

export function Header() {
  const { data: session } = useSession();
  const count = useCartStore(s => s.count());

  const [menuOpen, setMenuOpen]         = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen]   = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [search, setSearch]             = useState('');
  // Controla renderizacao do badge do carrinho somente apos hidratacao do client
  const [mounted, setMounted]           = useState(false);

  const router  = useRouter();
  const userRef = useRef<HTMLDivElement>(null);
  const catRef  = useRef<HTMLDivElement>(null);

  const isAdmin = (session?.user as any)?.role === 'admin';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (catRef.current  && !catRef.current.contains(e.target as Node))  setCatMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/products?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">

      {/* Barra principal */}
      <div className={cn(
        'transition-all duration-300',
        scrolled ? 'bg-dark-900/95 backdrop-blur-md shadow-xl shadow-black/30' : 'bg-transparent'
      )}>
        <div className="container-custom">
          <div className="flex items-center gap-4 h-16">

            {/* Logo */}
            <Link href="/" className="flex-none">
              <Image
                src="/logotecnoiso.png"
                alt="Tecnoiso"
                width={120}
                height={36}
                style={{ width: 'auto', height: '36px' }}
                className="object-contain"
                priority
              />
            </Link>

            {/* CEP */}
            <Link href="#" className="hidden lg:flex items-center gap-1.5 text-white/80 hover:text-white transition-colors flex-none">
              <MapPin className="w-4 h-4 flex-none" />
              <div className="leading-tight">
                <p className="text-[10px] text-white/60">Enviar para</p>
                <p className="text-xs font-600 underline underline-offset-2">Informe o CEP</p>
              </div>
            </Link>

            {/* Busca */}
            <form onSubmit={handleSearch} className="flex-1 flex">
              <div className="flex w-full rounded-lg overflow-hidden border-2 border-transparent focus-within:border-brand-400 transition-all">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar produtos, marcas e muito mais..."
                  className="flex-1 px-4 py-2.5 bg-white text-dark-900 text-sm outline-none placeholder:text-dark-400"
                />
                <button
                  type="submit"
                  className="px-4 bg-brand-600 hover:bg-brand-500 transition-colors flex items-center justify-center"
                >
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>

            {/* Auth + Cart */}
            <div className="flex items-center gap-3 flex-none">

              {/* Autenticacao */}
              {session ? (
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt=""
                        width={28}
                        height={28}
                        className="rounded-full ring-2 ring-white/30"
                      />
                    ) : (
                      <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div className="hidden sm:block text-left leading-tight">
                      <p className="text-[10px] text-white/70">
                        Ola, {session.user?.name?.split(' ')[0]}
                      </p>
                      <p className="text-xs font-700 flex items-center gap-0.5">
                        Minha conta
                        <ChevronDown className={cn('w-3 h-3 transition-transform', userMenuOpen && 'rotate-180')} />
                      </p>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 animate-slide-down">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-400">Logado como</p>
                        <p className="text-sm font-600 text-gray-800 truncate">{session.user?.email}</p>
                        {isAdmin && (
                          <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-600 mt-1 inline-block">
                            Admin
                          </span>
                        )}
                      </div>
                      <Link href="/orders" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <ShoppingCart className="w-4 h-4 text-gray-400" /> Meus Pedidos
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50 transition-colors">
                          <LayoutDashboard className="w-4 h-4" /> Painel Admin
                        </Link>
                      )}
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" /> Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => signIn('google')}
                  className="text-white hover:text-white/80 transition-colors hidden sm:block text-left leading-tight"
                >
                  <p className="text-[10px] text-white/70">Bem-vindo!</p>
                  <p className="text-xs font-700">Entrar / Cadastrar</p>
                </button>
              )}

              <Link href="/orders" className="hidden sm:block text-white hover:text-white/80 transition-colors text-xs font-600">
                Compras
              </Link>

              <Link href="/contact" className="hidden sm:block text-white hover:text-white/80 transition-colors text-xs font-600">
                Contato
              </Link>

              {/* Carrinho — badge so renderiza apos hidratacao para evitar mismatch */}
              <Link href="/cart" className="relative text-white hover:text-white/80 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {mounted && count > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-600 rounded-full text-[10px] font-700 text-white flex items-center justify-center">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </Link>

              {/* Menu mobile */}
              <button className="sm:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra secundaria com categorias */}
      <div className={cn(
        'border-t border-white/10 transition-all duration-300',
        scrolled ? 'bg-dark-800/95 backdrop-blur-md' : 'bg-transparent'
      )}>
        <div className="container-custom">
          <div className="flex items-center gap-6 h-10 text-white text-xs font-500">

            <div className="relative" ref={catRef}>
              <button
                onClick={() => setCatMenuOpen(!catMenuOpen)}
                className="flex items-center gap-1 hover:text-white/80 transition-colors font-600"
              >
                Categorias
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', catMenuOpen && 'rotate-180')} />
              </button>

              {catMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 animate-slide-down">
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat.slug}
                      href={`/products?category=${cat.slug}`}
                      onClick={() => setCatMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/products?offer=true" className="hover:text-white/80 transition-colors">Ofertas</Link>
            <Link href="/contact" className="hover:text-white/80 transition-colors">Contato</Link>

            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-1 ml-auto text-yellow-300 hover:text-yellow-200 transition-colors">
                <Settings className="w-3.5 h-3.5" /> Administrador
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Menu mobile expandido */}
      {menuOpen && (
        <div className="sm:hidden bg-dark-900/95 backdrop-blur-md border-t border-white/10 py-3 animate-slide-down">
          <div className="container-custom flex flex-col gap-1">
            {[
              { href: '/',         label: 'Inicio' },
              { href: '/products', label: 'Produtos' },
              { href: '/cart',     label: `Carrinho (${mounted ? count : 0})` },
              { href: '/orders',   label: 'Compras' },
              { href: '/contact',  label: 'Contato' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!session && (
              <button
                onClick={() => signIn('google')}
                className="mx-4 mt-2 py-3 bg-brand-600 text-white rounded-lg text-sm font-700 transition-colors hover:bg-brand-500"
              >
                Entrar com Google
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}