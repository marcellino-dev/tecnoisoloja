// =============================================
// TECNOISO SHOP - Types & Interfaces
// =============================================

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  stock: number;
  sku?: string;
  category_id?: string;
  category?: Category;
  images: string[];
  specs?: Record<string, string>;
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'shipped' | 'delivered';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  user_id: string;
  user?: User;
  status: OrderStatus;
  total: number;
  shipping_address?: ShippingAddress;
  pagseguro_code?: string;
  pagseguro_link?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface DashboardMetrics {
  total_revenue: number;
  total_orders: number;
  pending_orders: number;
  total_users: number;
  total_products: number;
  recent_orders: Order[];
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// PagSeguro
export interface PagSeguroCheckoutPayload {
  order_id: string;
  items: Array<{
    id: string;
    description: string;
    amount: number;
    quantity: number;
  }>;
  sender: {
    name: string;
    email: string;
    phone?: string;
  };
  shipping?: {
    address: ShippingAddress;
  };
  redirect_url: string;
  notification_url: string;
}
