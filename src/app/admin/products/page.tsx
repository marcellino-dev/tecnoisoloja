import { createAdminClient } from '@/lib/supabase/server';
import { AdminProductsClient } from '@/components/admin/AdminProductsClient';

export const metadata = { title: 'Produtos | Admin' };

export default async function AdminProductsPage() {
  const supabase = createAdminClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, category:categories(name)').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
  ]);

  return <AdminProductsClient initialProducts={products || []} categories={categories || []} />;
}
