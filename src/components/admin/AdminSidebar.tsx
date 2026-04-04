'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  LogOut, Zap, X, Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const NAV = [
  { href: '/admin',          label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produtos',   icon: Package },
  { href: '/admin/orders',   label: 'Pedidos',    icon: ShoppingBag },
  { href: '/admin/users',    label: 'Usuários',   icon: Users },
];

export function AdminSidebar() {
  const pathname  = usePathname();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-dark-700">
        <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-800 text-white">
          TECNO<span className="text-brand-500">ISO</span>
        </span>
        <span className="badge bg-brand-600/20 text-brand-400 text-[10px] ml-1">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display font-500 transition-all',
                active
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-dark-700 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-400 hover:text-white hover:bg-dark-700 transition-all font-display font-500">
          ← Voltar à Loja
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all font-display font-500"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-dark-700 rounded-lg text-white"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-60 bg-dark-800 border-r border-dark-700 z-50 transition-transform duration-300',
        'lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}
