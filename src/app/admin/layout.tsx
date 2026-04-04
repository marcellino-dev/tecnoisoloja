import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const metadata = { title: 'Painel Admin | Tecnoiso' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex bg-dark-900">
      <AdminSidebar />
      <main className="flex-1 lg:ml-60 p-6 pt-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
