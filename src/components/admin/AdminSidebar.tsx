'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, X, Menu, Store, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const NAV = [
  { href: '/admin',          label: 'Painel',    icon: LayoutDashboard, desc: 'Visão geral' },
  { href: '/admin/products', label: 'Produtos',  icon: Package,         desc: 'Gerencie estoque' },
  { href: '/admin/orders',   label: 'Pedidos',   icon: ShoppingBag,     desc: 'Gerencie vendas' },
  { href: '/admin/users',    label: 'Usuários',  icon: Users,           desc: 'Base de clientes' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0a' }}>

      {/* Logo */}
      <Link
        href="/"
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '20px 20px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          textDecoration: 'none',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.75'}
        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
        title="Voltar para a loja"
      >
        <Image src="/logotecnoiso.png" alt="Tecnoiso" width={110} height={32} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        <span style={{
          fontSize: 10, fontWeight: 700,
          background: '#E63946',
          color: '#fff',
          padding: '2px 7px', borderRadius: 4,
          letterSpacing: '0.06em',
        }}>
          ADMIN
        </span>
      </Link>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 8,
                textDecoration: 'none',
                background: active ? '#E63946' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)';
                }
              }}
            >
              <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 1 }}>{item.desc}</div>
              </div>
              {active && (
                <div style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8,
            textDecoration: 'none', color: 'rgba(255,255,255,0.4)',
            fontSize: 13, transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)';
            (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
            (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)';
          }}
        >
          <Store style={{ width: 15, height: 15 }} />
          Ver Loja
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#E63946', fontSize: 13, fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(230,57,70,0.1)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
        >
          <LogOut style={{ width: 15, height: 15 }} />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="lg:hidden"
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 50,
          padding: 8, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: 'pointer',
          color: '#fff',
        }}
        onClick={() => setOpen(!open)}
      >
        {open ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
      </button>

      {open && (
        <div
          className="lg:hidden"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn('fixed top-0 left-0 h-full w-60 z-50 transition-transform duration-300', 'lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}