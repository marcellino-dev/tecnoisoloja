import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Aguardando',  color: 'text-yellow-400 bg-yellow-400/10' },
  paid:      { label: 'Pago',        color: 'text-green-400 bg-green-400/10'  },
  cancelled: { label: 'Cancelado',   color: 'text-red-400 bg-red-400/10'      },
  shipped:   { label: 'Enviado',     color: 'text-blue-400 bg-blue-400/10'    },
  delivered: { label: 'Entregue',    color: 'text-emerald-400 bg-emerald-400/10' },
};
